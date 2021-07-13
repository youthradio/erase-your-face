<template>
  <div ref="container">
    <div id="interactive" ref="interactivecontainer"></div>
    <div class="grid">
      <div class="canvas-grid center">
        <div class="relative mw5 mw6-ns">
          <div class="relative">
            <div
              class="
                f7
                f5-ns
                roboto-mono
                ttu
                absolute
                top-0
                w-100
                tc
                white
                lh-title
                tracked
                pointer-events-none
                z-1
                mt1
                mt3-ns
              "
            >
              Draw Over Me
            </div>
            <div
              class="
                flex flex-column
                items-center
                absolute
                top-0
                left-0
                z-1
                pa1
                pa3-ns
              "
              :style="{ pointerEvents: isDrawing ? 'none' : 'inherit' }"
            >
              <BrushesComponent :enable-undo-button="enableUndoButton" />
            </div>
            <div
              class="
                absolute
                top-0
                right-0
                z-1
                pa1
                pa3-ns
                flex flex-column
                items-center
              "
              :style="{ opacity: UIState.isLoadingResult ? '0.5' : '1' }"
            >
              <a
                class="db f7 f5-ns no-underline b--white white grow mb2"
                href="#"
                @click.prevent="
                  () =>
                    !isLoadingResult
                      ? setUIState({ selectedAction: 'another-face' })
                      : null
                "
              >
                <FaceButton />
              </a>
              <a
                class="db f7 f5-ns no-underline b--white white grow"
                href="#"
                @click.prevent="
                  () =>
                    !isLoadingResult
                      ? setUIState({ selectedAction: 'clear-canvas' })
                      : null
                "
              >
                <TrashButton class="max-width" />
              </a>
            </div>
            <div class="absolute bottom-0 right-0 z-1 pa1 pa3-ns">
              <a
                :class="[
                  'roboto-mono db pa1 ph2-ns ba br-pill bw1 b tc f7 f5-ns no-underline b--white',
                  !UIState.isLoadingResult
                    ? 'grow green bg-white shadow-3'
                    : 'o-50 white bg-inherit',
                ]"
                href="#"
                @click.prevent="setUIState({ selectedAction: 'submit-test' })"
              >
                {{ !UIState.isLoadingResult ? 'SUBMIT' : 'LOADING' }}
              </a>
            </div>
            <canvas
              ref="canvas"
              tabindex="0"
              @pointercancel.prevent="mouseEvent"
              @pointerdown.prevent="mouseEvent"
              @pointerup.prevent="mouseEvent"
              @pointermove.prevent="mouseEvent"
              @pointerout.prevent="mouseEvent"
              @pointerleave.prevent="mouseEvent"
              @touchmove.prevent=""
            ></canvas>
            <canvas
              ref="drawinglayer"
              class="absolute top-0 left-0 pointer-events-none"
            ></canvas>
          </div>
        </div>
      </div>
      <div class="results-grid">
        <ResultScreen />
      </div>
      <div class="faces-grid ph2 mt-auto center">
        <FacesGrid ref="facegrid" />
      </div>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { lambdaAppURL } from '../../post.config'
import BrushesComponent from './BrushesComponent.vue'
import FaceButton from './FaceButton.vue'
import TrashButton from './TrashButton.vue'
import ResultScreen from './ResultScreen.vue'
import FacesGrid from './FacesGrid.vue'

export default {
  name: 'Canvas',
  components: {
    FacesGrid,
    BrushesComponent,
    FaceButton,
    TrashButton,
    ResultScreen,
  },
  props: {},
  data() {
    return {
      isAwake: false,
      isReadytoDraw: false,
      layers: new Map(),
      enableUndoButton: false,
      currLayerId: null,
      main: { canvas: null, ctx: null },
      target: { canvas: null, ctx: null },
      layer: { canvas: null, ctx: null },
      drawingLayer: { canvas: null, ctx: null },
      drawingTempLayer: { canvas: null, ctx: null },
      lastMouse: {},
      currTargetImgBlob: null,
      currTargetImg: null,
      currTargetImgBlobNew: null,
      lastTimerPointerUp: null,
      testFetchController: null,
    }
  },
  computed: {
    referenceImages() {
      return this.$store.state.referenceImages
    },
    UIState() {
      return this.$store.state.UIState
    },
    brushMode() {
      return this.UIState.selectedMode === 'brush'
    },
    isLoadingResult() {
      return this.UIState.isLoadingResult
    },
    isDrawing() {
      return this.UIState.isDrawing
    },
    randomImagesIds() {
      return this.$store.state.UIState.randomImagesIds
    },
    targetImageId() {
      return this.$store.state.UIState.targetImageId
    },
    faceMatches() {
      if (this.$store.state.testResult.result) {
        return this.$store.state.testResult.result.FaceMatches
      }
      return []
    },
    umatchedFaces() {
      if (this.$store.state.testResult.result) {
        return this.$store.state.testResult.result.UnmatchedFaces
      }
      return []
    },
  },
  watch: {
    async 'UIState.selectedAction'(action) {
      if (action === 'undo') {
        this.rollBack()
        // clean action state so it triggers watch again

        this.setUIState({ selectedAction: null })
      } else if (action === 'another-face') {
        // random position for reference image
        this.$refs.facegrid.loadFaceGridImages()
        this.clearAll()
        this.updateTargetImage()

        this.setUIState({ selectedAction: null })
      } else if (action === 'submit-test') {
        // if it's not loading
        if (!this.isLoadingResult) {
          await this.testImages()
          this.$refs.facegrid.showMasks()

          // clean action state so it triggers watch again
        }
        this.setUIState({ selectedAction: null })
      } else if (action === 'clear-canvas') {
        this.clearAll()
        this.updateTargetImage()

        this.setUIState({ selectedAction: null })
      } else if (action === 'try-again') {
        this.setUIState({ selectedAction: null })

        // this.setUIState({ selectedAction: 'another-face' })
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
        this.rollBack()
        this.setUIState({ selectedAction: null })
      }
    })
    this.initCanvases()
    this.updateTargetImage()
    this.isReadytoDraw = true
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.wakeup()
            observer.disconnect()
          }
        })
      },
      { root: null, rootMargin: '50px', threshold: 1 }
    )
    observer.observe(this.$refs.interactivecontainer)
  },
  methods: {
    initCanvases() {
      // background canvas
      this.main.canvas = this.$refs.canvas
      this.main.canvas.width = 512
      this.main.canvas.height = 512
      this.main.ctx = this.main.canvas.getContext('2d')
      // this.main.ctx.imageSmoothingEnabled = true

      // this.main.ctx.globalCompositeOperation = 'overlay'
      // this.main.ctx.globalCompos`teOperation = 'lighten'

      //  canvas for layer, rollback undo
      this.layer.canvas = document.createElement('canvas')
      this.layer.canvas.width = this.layer.canvas.height =
        this.main.canvas.width
      this.layer.ctx = this.layer.canvas.getContext('2d')
      this.layer.ctx.lineWidth = 16
      this.layer.ctx.lineJoin = this.layer.ctx.lineCap = 'round'
      // this.layer.ctx.imageSmoothingEnabled = true
      // this.layer.ctx.translate(-0.5, -0.5)

      // drawing canvas overlaying main canvas
      this.drawingLayer.canvas = this.$refs.drawinglayer
      this.drawingLayer.canvas.width = this.drawingLayer.canvas.height =
        this.main.canvas.width
      this.drawingLayer.ctx = this.drawingLayer.canvas.getContext('2d')
      this.drawingLayer.ctx.lineWidth = 16
      this.drawingLayer.ctx.lineJoin = this.drawingLayer.ctx.lineCap = 'round'

      this.drawingTempLayer.canvas = document.createElement('canvas')
      this.drawingTempLayer.canvas.width = this.drawingTempLayer.canvas.height =
        this.main.canvas.width
      this.drawingTempLayer.ctx = this.drawingTempLayer.canvas.getContext('2d')
      this.drawingTempLayer.ctx.lineWidth = 16
      this.drawingTempLayer.ctx.lineJoin = this.drawingTempLayer.ctx.lineCap =
        'round'
      // this.drawingLayer.ctx.translate(0.5, 0.5)

      this.drawingLayer.ctx.imageSmoothingEnabled = true
    },
    // load image , when ready, draw on contex, postion x,y with width and height , w,h
    loadImage(url, ctx, x, y, w, h) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          resolve(img)
        }
        img.src = url
      }).then((img) => {
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h)
      })
    },
    setUIState(state) {
      this.$store.dispatch('setUIState', { ...state })
    },
    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    async wakeup() {
      return await fetch(lambdaAppURL + 'wakeup')
    },
    async testImages() {
      this.setUIState({ isLoadingResult: true })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = this.main.canvas.width
      canvas.height = this.main.canvas.height
      const scale = 0.5

      ctx.drawImage(
        this.main.canvas,
        0,
        0,
        this.main.canvas.width * scale,
        this.main.canvas.height * scale
      )

      const targetImageURL = canvas.toDataURL('image/jpeg', 0.8)

      const targetBlob = await fetch(targetImageURL).then((res) => res.blob())

      // source blob is the grid with all image and reference

      canvas.width = this.$refs.facegrid.getCanvas().width
      canvas.height = this.$refs.facegrid.getCanvas().height

      ctx.drawImage(
        this.$refs.facegrid.getCanvas(),
        0,
        0,
        this.$refs.facegrid.getCanvas().width,
        this.$refs.facegrid.getCanvas().height
      )
      const sourceImageURL = canvas.toDataURL('image/jpeg', 0.8)
      const sourceBlob = await fetch(sourceImageURL).then((res) => res.blob())
      const formData = new FormData()

      formData.append('referenceimage', targetBlob, 'refimg.jpg')
      formData.append('targetimage', sourceBlob, 'targetimg.jpg')
      try {
        this.testFetchController = new AbortController()

        const result = await fetch(lambdaAppURL + 'push', {
          method: 'POST',
          body: formData,
          header: {
            'Content-Type': 'multipart/form-data',
          },
          signal: this.testFetchController.signal,
        }).then((res) => res.json())
        this.setUIState({ isLoadingResult: false })
        this.$store.dispatch('setResultState', {
          loading: false,
          result,
          targetImg: sourceBlob,
          refImg: targetBlob,
        })
      } catch (error) {
        this.setUIState({ isLoadingResult: false })
        this.$store.dispatch('setResultState', {
          loading: false,
          result: null,
          targetImg: null,
          refImg: null,
          error,
        })
      }
    },
    rollBack() {
      if (this.layers.size <= 0) {
        this.enableUndoButton = false
        return
      }
      // clear current layer
      const ids = Array.from(this.layers.keys())
      this.layers.delete(ids[ids.length - 1])
      this.enableUndoButton = !(this.layers.size <= 0)

      // clear main canvas
      this.clearCanvas(this.main)
      // redraw target image
      this.drawImage(this.main, this.currTargetImg)
      // draw all layers after pop last layer
      this.drawLayers()

      this.clearCanvas(this.drawingLayer)
      this.clearCanvas(this.drawingTempLayer)

      // draw layer to main canvas
      this.main.ctx.drawImage(this.layer.canvas, 0, 0)
    },
    drawLayers() {
      const tempcanvas = document.createElement('canvas')
      tempcanvas.width = 512
      tempcanvas.height = 512
      const tempctx = tempcanvas.getContext('2d')
      tempctx.lineJoin = tempctx.lineCap = 'round'
      // tempctx.translate(0.5, 0.5)

      this.clearCanvas(this.layer)

      // iterate over layers array
      Array.from(this.layers.values()).forEach((layer) => {
        // clear temp canvas
        tempctx.clearRect(
          0,
          0,
          this.layer.canvas.width,
          this.layer.canvas.height
        )
        tempctx.strokeStyle = layer.color
        tempctx.lineWidth = layer.size
        layer.points.forEach((point, i) => {
          if (i <= 0) {
            tempctx.beginPath()
            tempctx.moveTo(point[0], point[1])
          }
          tempctx.lineTo(point[0], point[1])
          tempctx.stroke()
        })

        // opacity before drawing final path on temp cavas

        this.layer.ctx.globalAlpha = layer.brushMode ? layer.opacity : 1.0
        this.layer.ctx.globalCompositeOperation = layer.brushMode
          ? 'source-over'
          : 'destination-out'
        this.layer.ctx.drawImage(tempcanvas, 0, 0)
        this.layer.ctx.globalCompositeOperation = 'source-over'

        // reset alpha after drawing on ctx
      })
    },
    drawImage(layer, image) {
      layer.ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        layer.canvas.width,
        image.height * (layer.canvas.width / image.width)
      )
    },
    clearCanvas(layer) {
      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    },
    clearAll() {
      this.layers = new Map()
      this.currLayerId = null
      this.enableUndoButton = false
      this.clearCanvas(this.layer)
      this.clearCanvas(this.main)
      this.clearCanvas(this.drawingLayer)
      this.clearCanvas(this.drawingTempLayer)
    },
    mouseEvent(event) {
      event.preventDefault()
      const rect = event.target.getBoundingClientRect()
      const posx = event.layerX / rect.width
      const posy = event.layerY / rect.height

      if (!this.isReadytoDraw) return
      // if (!this.isReadytoDraw || this.isLoadingResult) return
      const eventType = event.type
      if (
        eventType === 'pointerup' ||
        eventType === 'pointerleave' ||
        eventType === 'pointercancel' ||
        eventType === 'pointerout'
      ) {
        this.setUIState({ isDrawing: false })
        if (eventType === 'pointerup') {
          this.clearCanvas(this.main)
          this.drawImage(this.main, this.currTargetImg)
          this.layer.ctx.globalAlpha = this.brushMode
            ? this.UIState.selectedOpacity
            : 1
          this.layer.ctx.globalCompositeOperation = this.brushMode
            ? 'source-over'
            : 'destination-out'
          this.layer.ctx.drawImage(this.drawingLayer.canvas, 0, 0)
          this.layer.ctx.globalCompositeOperation = 'source-over'
          this.clearCanvas(this.drawingLayer)
          this.clearCanvas(this.drawingTempLayer)
          this.main.ctx.drawImage(this.layer.canvas, 0, 0)
          if (this.lastTimerPointerUp) {
            clearTimeout(this.lastTimerPointerUp)
          }
          this.lastTimerPointerUp = setTimeout(() => {
            this.setUIState({ selectedAction: 'submit-test' })
          }, 500)
        }
      } else if (eventType === 'pointerdown') {
        if (this.lastTimerPointerUp) {
          clearTimeout(this.lastTimerPointerUp)
        }
        if (!this.isAwake) {
          this.wakeup()
          this.isAwake = true
        }
        this.setUIState({ isDrawing: true })
        this.lastMouse = {
          x: posx * this.main.canvas.width,
          y: posy * this.main.canvas.height,
        }
        this.currLayerId = nanoid()
        const size = this.UIState.selectedStrokeWeight
        const color = this.UIState.selectedColor
        const opacity = this.brushMode ? this.UIState.selectedOpacity : 1.0
        const brushMode = this.brushMode
        this.layers.set(this.currLayerId, {
          size,
          color,
          opacity,
          brushMode,
          points: [],
        })
        this.enableUndoButton = true

        this.drawingTempLayer.ctx.strokeStyle = this.brushMode ? color : 'black'
        this.drawingTempLayer.ctx.lineWidth = size
        this.drawingLayer.canvas.style.opacity = this.brushMode ? opacity : 1.0
      } else if (eventType === 'pointermove' && this.isDrawing) {
        const currLayer = this.layers.get(this.currLayerId)
        currLayer.points.push([
          posx * this.main.canvas.width,
          posy * this.main.canvas.height,
        ])
        this.drawingTempLayer.ctx.beginPath()
        this.drawingTempLayer.ctx.moveTo(this.lastMouse.x, this.lastMouse.y)
        this.drawingTempLayer.ctx.lineTo(
          posx * this.main.canvas.width,
          posy * this.main.canvas.height
        )
        this.drawingTempLayer.ctx.stroke()
        if (!this.brushMode) {
          this.drawingTempLayer.ctx.globalCompositeOperation = 'source-in'
          this.drawingTempLayer.ctx.drawImage(
            this.currTargetImg,
            0,
            0,
            this.currTargetImg.width,
            this.currTargetImg.height,
            0,
            0,
            this.main.canvas.width,
            this.currTargetImg.height *
              (this.drawingTempLayer.canvas.width / this.currTargetImg.width)
          )
          this.drawingTempLayer.ctx.globalCompositeOperation = 'source-over'
          this.drawingLayer.ctx.drawImage(this.drawingTempLayer.canvas, 0, 0)
        } else {
          this.drawingLayer.ctx.drawImage(this.drawingTempLayer.canvas, 0, 0)
        }

        this.lastMouse = {
          x: posx * this.main.canvas.width,
          y: posy * this.main.canvas.height,
        }
      }
    },
    loadTargetImage() {
      const imgData = `faces/${this.targetImageId}.jpg`
      return new Promise((resolve, reject) => {
        return fetch(imgData)
          .then((res) => res.blob())
          .then((blob) => {
            this.currTargetImgBlob = blob
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = window.URL.createObjectURL(blob)
          })
      })
    },
    // draw target image on canvas
    async updateTargetImage() {
      this.currTargetImg = await this.loadTargetImage()
      this.drawImage(this.main, this.currTargetImg)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '~@/assets/css/variables';

.max-width {
  max-width: 1rem;
}

@media #{$breakpoint-not-small} {
  .max-width {
    max-width: 2rem;
  }
}
@media screen and (min-width: 321px) {
  .max-width {
    max-width: 1.5rem;
  }
}
canvas {
  display: block;
  width: 100%;
  height: auto;
}
.face {
  position: absolute;
  opacity: 0.5;
}
[id]::before {
  content: '';
  z-index: -100;
  pointer-events: none;
  display: block;
  height: 69px;
  margin-top: -69px;
  visibility: hidden;
}
.safari-border {
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  // -webkit-backface-visibility: hidden;
  // -moz-backface-visibility: hidden;
  // -webkit-transform: translate3d(0, 0, 0);
  // -moz-transform: translate3d(0, 0, 0);
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
}
.canvas-grid {
  grid-column: 1;
  grid-row: 1;
}
.results-grid {
  grid-column: 1;
  grid-row: 2;
}
.faces-grid {
  grid-column: 1;
  grid-row: 3;
}
@media #{$breakpoint-not-small} {
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .canvas-grid {
    grid-column: 1;
    grid-row: 1/3;
  }
  .results-grid {
    grid-column: 2;
    grid-row: 1;
  }
  .faces-grid {
    grid-column: 2;
    grid-row: 2;
  }
}
</style>
