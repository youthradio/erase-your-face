<template>
  <div ref="container" class="relative">
    <BrushesComponent class="absolute top-0 left-0" />
    <div
      class="absolute top-0 right-0"
      :style="isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }"
    >
      <a
        :class="[
          'db pa1 ba br-pill bw1  b  tc f4 no-underline b--white white',
          !UIState.isLoadingResult ? 'grow' : 'o-50'
        ]"
        href="#"
        @click.prevent="setActionState('submit-test')"
      >
        {{ !UIState.isLoadingResult ? 'SUBMIT' : 'LOADING' }}
      </a>
    </div>
    <canvas
      ref="canvas"
      tabindex="0"
      @touchstart.prevent="mouseEvent"
      @touchend.prevent="mouseEvent"
      @touchmove.prevent="mouseEvent"
      @mousedonw.prevent="mouseEvent"
      @mousedown.prevent="mouseEvent"
      @mouseup.prevent="mouseEvent"
      @mousemove.prevent="mouseEvent"
    ></canvas>
    <canvas ref="canvastarget" class="canvas-target" tabindex="0"></canvas>
  </div>
</template>

<script>
import { lambdaAppURL } from '../../post.config'
import BrushesComponent from './BrushesComponent.vue'

export default {
  name: 'Canvas',
  components: {
    BrushesComponent
  },
  props: {},
  data() {
    return {
      isReadytoDraw: false,
      isDrawing: false,
      historyPointer: -1,
      history: {
        points: [],
        colors: [],
        sizes: []
      },
      penSet: false,
      main: { canvas: null, ctx: null },
      target: { canvas: null, ctx: null },
      layer: { canvas: null, ctx: null },
      currTargetImgBlob: null,
      currTargetImg: null,
      currTargetImgBlobNew: null,
      targetImageId: null
    }
  },
  computed: {
    referenceImages() {
      return this.$store.state.referenceImages
    },
    UIState() {
      return this.$store.state.UIState
    }
  },
  watch: {
    'UIState.selectedAction'(action) {
      console.log(action)
      if (action === 'undo') {
        this.rollBack()
        // clean action state so it triggers watch again
        this.$store.dispatch('setUIState', {
          selectedAction: null
        })
      } else if (action === 'submit-test') {
        // if it's not loading
        if (!this.UIState.isLoadingResult) {
          console.log('|TESTing')
          this.testImages()
          // clean action state so it triggers watch again
        }
        this.$store.dispatch('setUIState', {
          selectedAction: null
        })
      }
    }
    // history: {
    //   handler() {
    //     // console.log('POINTs')
    //   },
    //   deep: true
    // }
  },
  mounted() {
    document.addEventListener('mouseup', this.mouseEvent)
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
        this.rollBack()
      }
    })
    this.initCanvases()
    this.loadTargetImage()
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

      // foregound canvas
      this.layer.canvas = document.createElement('canvas')
      this.layer.canvas.width = this.layer.canvas.height = this.main.canvas.width
      this.layer.ctx = this.layer.canvas.getContext('2d')
      this.layer.ctx.lineWidth = 10
      this.layer.ctx.lineJoin = this.layer.ctx.lineCap = 'round'

      // testing  target canvas
      const P_TOTAL = 1117
      this.target.canvas = this.$refs.canvastarget
      this.target.canvas.width = 1000
      this.target.canvas.height = 300
      this.target.ctx = this.target.canvas.getContext('2d')
      const sidelen = 50

      const tx = ~~(this.target.canvas.width / sidelen)
      const ty = ~~(this.target.canvas.height / sidelen)
      // random unique ids
      const randomIds = new Set()
      while (randomIds.size < tx * ty) {
        randomIds.add(~~(1 + Math.random() * P_TOTAL))
      }
      const randomImages = [...randomIds]

      // random position for reference image
      this.targetImageId = randomImages[~~(Math.random() * randomImages.length)]
      let i = 0
      for (let x = 0; x < tx; x++) {
        for (let y = 0; y < ty; y++) {
          // when position matches random id, use reference image
          const url = `faces/${randomImages[i]}.jpg`
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

    setActionState(state) {
      this.$store.dispatch('setUIState', {
        selectedAction: state
      })
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
      this.$store.dispatch('setUIState', {
        isLoadingResult: true
      })
      const targetImageURL = this.main.canvas.toDataURL('image/jpeg', 0.8)

      const targetBlob = await fetch(targetImageURL).then((res) => res.blob())

      // source blob is the grid with all image and reference
      const sourceImageURL = this.target.canvas.toDataURL('image/jpeg', 0.8)
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

        console.log('result', result)
        console.log(sourceBlob, targetBlob)
        this.$store.dispatch('setUIState', {
          isLoadingResult: false
        })
        this.$store.dispatch('setResultState', {
          loading: false,
          result,
          targetImg: sourceBlob,
          refImg: targetBlob
        })
      } catch (error) {
        console.log(error)
        this.$store.dispatch('setUIState', {
          isLoadingResult: false
        })
        this.$store.dispatch('setResultState', {
          loading: false,
          error
        })
      }
    },
    rollBack() {
      if (!this.history.points.length) {
        console.log('RETUNR')
        return
      }
      // clear layer
      this.layer.ctx.clearRect(
        0,
        0,
        this.layer.canvas.width,
        this.layer.canvas.height
      )
      this.history.points.pop()
      this.history.colors.pop()
      this.history.sizes.pop()
      this.historyPointer--
      // this.$set(this.history, "points", );

      this.history.points.forEach((points, historyIndex) => {
        this.layer.ctx.strokeStyle = this.history.colors[historyIndex]
        this.layer.ctx.lineWidth = this.history.sizes[historyIndex]
        points.forEach((point, i) => {
          if (i <= 0) {
            this.layer.ctx.beginPath()
            this.layer.ctx.moveTo(point[0], point[1])
          }
          this.layer.ctx.lineTo(point[0], point[1])
          this.layer.ctx.stroke()
        })
      })
      this.main.ctx.drawImage(
        this.currTargetImg,
        0,
        0,
        this.currTargetImg.width,
        this.currTargetImg.height,
        0,
        0,
        this.main.canvas.width,
        this.currTargetImg.height *
          (this.main.canvas.width / this.currTargetImg.width)
      )

      this.main.ctx.drawImage(this.layer.canvas, 0, 0)
    },

    clearCanvas() {
      this.$set(this.history, 'points', [])
      this.historyPointer = -1
      this.layer.ctx.clearRect(
        0,
        0,
        this.layer.canvas.width,
        this.layer.canvas.height
      )
      this.main.ctx.clearRect(
        0,
        0,
        this.main.canvas.width,
        this.main.canvas.height
      )
    },
    mouseEvent(event) {
      event.preventDefault()
      if (!this.isReadytoDraw) return
      const eventType = event.type
      if (eventType === 'mouseup' || eventType === 'touchend') {
        this.isDrawing = false
        this.$store.dispatch('setUIState', {
          isDrawing: false
        })
      } else if (eventType === 'mousedown' || eventType === 'touchstart') {
        this.historyPointer++
        this.isDrawing = true
        this.$store.dispatch('setUIState', {
          isDrawing: true
        })
        this.penSet = false
      } else if (
        (eventType === 'mousemove' || eventType === 'touchmove') &&
        this.isDrawing
      ) {
        const rect = event.target.getBoundingClientRect()
        // const bodyRect = document.body.getBoundingClientRect();/

        const posx =
          ((event.pageX || event.touches[0].pageX) -
            (rect.left + document.documentElement.scrollLeft)) /
          rect.width

        const posy =
          ((event.pageY || event.touches[0].pageY) -
            (rect.top + document.documentElement.scrollTop)) /
          rect.height

        if (this.history.points[this.historyPointer] === undefined) {
          this.$set(this.history.points, this.historyPointer, [])

          this.$set(
            this.history.sizes,
            this.historyPointer,
            this.UIState.selectedStrokeWeight
          )
          this.$set(
            this.history.colors,
            this.historyPointer,
            this.UIState.selectedColor
          )
        }
        const currPoints = this.history.points[this.historyPointer]
        this.$set(
          this.history.points,
          this.historyPointer,
          currPoints.concat([
            [posx * this.main.canvas.width, posy * this.main.canvas.height]
          ])
        )
        // console.log("DRAW", this.history.points);
        this.draw()
      }
    },
    draw() {
      const points = this.history.points[this.historyPointer]
      const pos = points.length - 1
      this.layer.ctx.strokeStyle = this.history.colors[this.historyPointer]
      this.layer.ctx.lineWidth = this.history.sizes[this.historyPointer]
      if (!this.penSet) {
        this.penSet = true
        this.layer.ctx.beginPath()
        this.layer.ctx.moveTo(points[pos][0], points[pos][1])
      }
      this.layer.ctx.lineTo(points[pos][0], points[pos][1])
      this.layer.ctx.stroke()
      this.main.ctx.drawImage(this.layer.canvas, 0, 0)
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
      this.main.ctx.drawImage(
        this.currTargetImg,
        0,
        0,
        this.currTargetImg.width,
        this.currTargetImg.height,
        0,
        0,
        this.main.canvas.width,
        this.currTargetImg.height *
          (this.main.canvas.width / this.currTargetImg.width)
      )
    }
  }
}
</script>
<style lang="scss" scoped>
canvas {
  display: block;
  width: 100%;
  height: auto;
}
.canvas-target {
  min-width: 100vw;
  margin-left: calc(-100vw / 2 + 100% / 2);
  margin-right: calc(-100vw / 2 + 100% / 2);
}
// canvas {
//   width: 100%;
//   height: auto;
//   // touch-action: none;
// }
</style>
