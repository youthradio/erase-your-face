<template>
  <div class="relative mw7">
    <canvas ref="canvastarget" class="canvas-target" tabindex="0"></canvas>
    <div
      v-if="(faceMatches || umatchedFaces) && bShowMasks"
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
          height: `${res.Face.BoundingBox.Height * 100}%`,
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
          height: `${res.BoundingBox.Height * 100}%`,
        }"
      ></div>
    </div>
  </div>
</template>

<script>
// total num on samples pictures faces
const P_TOTAL = 1117

export default {
  name: 'FacesGrid',
  props: {},
  data() {
    return {
      target: { canvas: null, ctx: null },
      bShowMasks: false,
    }
  },
  computed: {
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
    randomImagesIds() {
      return this.$store.state.UIState.randomImagesIds
    },
    UIState() {
      return this.$store.state.UIState
    },
  },
  mounted() {
    // testing  target canvas with grid of faces
    this.target.canvas = this.$refs.canvastarget
    this.target.canvas.width = window.innerWidth > 700 ? 900 : 700
    this.target.canvas.height = 300
    this.target.ctx = this.target.canvas.getContext('2d')
    this.target.ctx.imageSmoothingEnabled = true
    this.loadFaceGridImages()
  },
  methods: {
    showMasks() {
      this.bShowMasks = true
    },
    loadFaceGridImages() {
      // face grid sidelenght
      const sidelen = 100
      this.bShowMasks = false
      const tx = ~~(this.target.canvas.width / sidelen)
      const ty = ~~(this.target.canvas.height / sidelen)
      // random unique ids
      const randomIds = new Set()
      while (randomIds.size < tx * ty) {
        randomIds.add(~~(1 + Math.random() * P_TOTAL))
      }
      // random position for reference image
      const randomImagesIds = [...randomIds]

      this.setUIState({
        randomImagesIds,
        targetImageId:
          randomImagesIds[~~(Math.random() * randomImagesIds.length)],
      })

      let i = 0
      const promises = []
      // loading random faces
      for (let x = 0; x < tx; x++) {
        for (let y = 0; y < ty; y++) {
          const url = `faces/${this.randomImagesIds[i]}.jpg`
          i++
          promises.push(
            this.loadImage(
              url,
              this.target.ctx,
              x * sidelen,
              y * sidelen,
              sidelen,
              sidelen
            )
          )
        }
      }
      return Promise.all(promises)
    },
    setUIState(state) {
      this.$store.dispatch('setUIState', { ...state })
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
    getCanvas() {
      return this.target.canvas
    },
  },
}
</script>

<style lang="scss" scoped>
canvas {
  display: block;
  width: 100%;
  height: auto;
}
.face {
  position: absolute;
  opacity: 0.5;
}
</style>
