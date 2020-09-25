<template>
  <div ref="container">
    <div id="interactive" ref="interactivecontainer"></div>
    <div class="br3 relative safari-border">
      <div class="relative">
        <div
          class="flex flex-column items-center pa1 pa3-ns absolute top-0 left-0 z-1"
          :style="{ pointerEvents: isDrawing ? 'none' : '' }"
        >
          <BrushesComponent :enable-undo-button="enableUndoButton" />
        </div>
        <div
          class="absolute top-0 right-0 z-1 pa1 pa3-ns flex flex-column items-center"
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
            class="db f7 f5-ns no-underline b--white white grow"
            href="#"
            :style="{ opacity: UIState.isLoadingResult ? '0.5' : '1' }"
            @click.prevent="setUIState({ selectedAction: 'submit-test' })"
          >
            <div>
              <SubmitButton />
              <div>{{ UIState.isLoadingResult ? 'LOADING' : 'SUBMIT' }}</div>
            </div>
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
    <div id="result" ref="resultcontainer"></div>
    <div class="full-width relative mw9 mt3">
      <canvas ref="canvastarget" class="canvas-target" tabindex="0"></canvas>
      <div
        v-if="faceMatches || umatchedFaces"
        class="absolute w-100 h-100 top-0 left-0"
      >
        <div
          v-for="(res, i) in faceMatches"
          :key="`facematche-${i}`"
          class="face bg-green"
          :style="{
            left: `${res.Face.BoundingBox.Left * 100}%`,
            top: `${res.Face.BoundingBox.Top * 100}%`,
            width: `${res.Face.BoundingBox.Width * 100}%`,
            height: `${res.Face.BoundingBox.Height * 100}%`
          }"
        ></div>
        <div
          v-for="(res, i) in umatchedFaces"
          :key="`faceunmatche-${i}`"
          class="face bg-red"
          :style="{
            left: `${res.BoundingBox.Left * 100}%`,
            top: `${res.BoundingBox.Top * 100}%`,
            width: `${res.BoundingBox.Width * 100}%`,
            height: `${res.BoundingBox.Height * 100}%`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import smoothscroll from 'smoothscroll-polyfill'
import { lambdaAppURL } from '../../post.config'
import BrushesComponent from './BrushesComponent.vue'
import FaceButton from './FaceButton.vue'
import SubmitButton from './SubmitButton.vue'
import TrashButton from './TrashButton.vue'

if (process.client) {
  smoothscroll.polyfill()
}
// total num on samples pictures faces
const P_TOTAL = 1117
export default {
  name: 'Canvas',
  components: {
    BrushesComponent,
    FaceButton,
    SubmitButton,
    TrashButton
  },
  props: {},
  data() {
    return {
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
      targetImageId: null,
      randomImagesIds: null
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
    }
  },
  watch: {
    async 'UIState.selectedAction'(action) {
      if (action === 'undo') {
        this.rollBack()
        // clean action state so it triggers watch again

        this.setUIState({ selectedAction: null })
      } else if (action === 'another-face') {
        // random position for reference image
        this.targetImageId = this.randomImagesIds[
          ~~(Math.random() * this.randomImagesIds.length)
        ]
        this.clearAll()
        this.updateTargetImage()

        this.setUIState({ selectedAction: null })

        this.$store.dispatch('setResultState', {
          loading: false,
          result: null,
          targetImg: null,
          refImg: null
        })
      } else if (action === 'submit-test') {
        // if it's not loading
        if (!this.isLoadingResult) {
          await this.testImages()
          // clean action state so it triggers watch again
          this.$refs.resultcontainer.scrollIntoView({ behavior: 'smooth' })
        }
        this.setUIState({ selectedAction: null })
      } else if (action === 'clear-canvas') {
        this.clearAll()
        this.updateTargetImage()

        this.setUIState({ selectedAction: null })
      } else if (action === 'try-again') {
        this.$refs.interactivecontainer.scrollIntoView({ behavior: 'smooth' })
        this.setUIState({ selectedAction: null })

        // this.setUIState({ selectedAction: 'another-face' })
      }
    }
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
      this.layer.canvas.width = this.layer.canvas.height = this.main.canvas.width
      this.layer.ctx = this.layer.canvas.getContext('2d')
      this.layer.ctx.lineWidth = 16
      this.layer.ctx.lineJoin = this.layer.ctx.lineCap = 'round'
      // this.layer.ctx.imageSmoothingEnabled = true
      // this.layer.ctx.translate(-0.5, -0.5)

      // drawing canvas overlaying main canvas
      this.drawingLayer.canvas = this.$refs.drawinglayer
      this.drawingLayer.canvas.width = this.drawingLayer.canvas.height = this.main.canvas.width
      this.drawingLayer.ctx = this.drawingLayer.canvas.getContext('2d')
      this.drawingLayer.ctx.lineWidth = 16
      this.drawingLayer.ctx.lineJoin = this.drawingLayer.ctx.lineCap = 'round'

      this.drawingTempLayer.canvas = document.createElement('canvas')
      this.drawingTempLayer.canvas.width = this.drawingTempLayer.canvas.height = this.main.canvas.width
      this.drawingTempLayer.ctx = this.drawingTempLayer.canvas.getContext('2d')
      this.drawingTempLayer.ctx.lineWidth = 16
      this.drawingTempLayer.ctx.lineJoin = this.drawingTempLayer.ctx.lineCap =
        'round'
      // this.drawingLayer.ctx.translate(0.5, 0.5)

      this.drawingLayer.ctx.imageSmoothingEnabled = true

      // testing  target canvas with grid of faces
      this.target.canvas = this.$refs.canvastarget
      this.target.canvas.width = window.innerWidth > 800 ? 1200 : 800
      this.target.canvas.height = window.innerWidth > 800 ? 300 : 300
      this.target.ctx = this.target.canvas.getContext('2d')
      this.target.ctx.imageSmoothingEnabled = true
      // face grid sidelenght
      const sidelen = 100

      const tx = ~~(this.target.canvas.width / sidelen)
      const ty = ~~(this.target.canvas.height / sidelen)
      // random unique ids
      const randomIds = new Set()
      while (randomIds.size < tx * ty) {
        randomIds.add(~~(1 + Math.random() * P_TOTAL))
      }
      this.randomImagesIds = [...randomIds]

      // random position for reference image
      this.targetImageId = this.randomImagesIds[
        ~~(Math.random() * this.randomImagesIds.length)
      ]
      let i = 0
      // loading random faces
      for (let x = 0; x < tx; x++) {
        for (let y = 0; y < ty; y++) {
          const url = `faces/${this.randomImagesIds[i]}.jpg`
          i++
          this.loadImage(
            url,
            this.target.ctx,
            x * sidelen,
            y * sidelen,
            sidelen,
            sidelen
          )
        }
      }
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

      canvas.width = this.target.canvas.width
      canvas.height = this.target.canvas.height

      ctx.drawImage(
        this.target.canvas,
        0,
        0,
        this.target.canvas.width,
        this.target.canvas.height
      )
      const sourceImageURL = canvas.toDataURL('image/jpeg', 0.8)
      const sourceBlob = await fetch(sourceImageURL).then((res) => res.blob())
      const formData = new FormData()

      formData.append('referenceimage', targetBlob, 'refimg.jpg')
      formData.append('targetimage', sourceBlob, 'targetimg.jpg')
      try {
        const result = await fetch(lambdaAppURL, {
          method: 'POST',
          body: formData,
          header: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => res.json())
        this.setUIState({ isLoadingResult: false })
        this.$store.dispatch('setResultState', {
          loading: false,
          result,
          targetImg: sourceBlob,
          refImg: targetBlob
        })
      } catch (error) {
        this.setUIState({ isLoadingResult: false })
        this.$store.dispatch('setResultState', {
          loading: false,
          result: null,
          targetImg: null,
          refImg: null,
          error
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

      if (!this.isReadytoDraw || this.isLoadingResult) return
      const eventType = event.type
      if (
        eventType === 'pointerup' ||
        eventType === 'pointerleave' ||
        eventType === 'pointercancel' ||
        eventType === 'pointerout'
      ) {
        this.setUIState({ isDrawing: false })
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
      } else if (eventType === 'pointerdown') {
        this.setUIState({ isDrawing: true })
        this.lastMouse = {
          x: posx * this.main.canvas.width,
          y: posy * this.main.canvas.height
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
          points: []
        })
        this.enableUndoButton = true

        this.drawingTempLayer.ctx.strokeStyle = this.brushMode ? color : 'black'
        this.drawingTempLayer.ctx.lineWidth = size
        this.drawingLayer.canvas.style.opacity = this.brushMode ? opacity : 1.0
      } else if (eventType === 'pointermove' && this.isDrawing) {
        const currLayer = this.layers.get(this.currLayerId)
        currLayer.points.push([
          posx * this.main.canvas.width,
          posy * this.main.canvas.height
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
          y: posy * this.main.canvas.height
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
    }
  }
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
.full-width {
  margin-left: calc(max(-100vw, -64rem) / 2 + 100% / 2);
  margin-right: calc(max(-100vw, -64rem) / 2 + 100% / 2);
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
</style>
