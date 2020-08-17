<template>
  <div ref="container">
    <h1 v-if="testResult.result">RESULT</h1>
    <h2 v-if="testResult.loading">LOADING</h2>
    <canvas ref="canvas"></canvas>
    <h1 v-if="matchesSimilarity">
      Similarity: {{ matchesSimilarity.toFixed(2) }}%
    </h1>
    <h3 v-if="testResult.error">{{ testResult.error }}</h3>
    <h3 v-if="testResult.result">
      {{ JSON.stringify(testResult.result, null, 2) }}
    </h3>
  </div>
</template>

<script>
export default {
  name: 'ResultScreen',
  props: {},
  data() {
    return {
      result: {
        canvas: null,
        ctx: null
      }
    }
  },
  computed: {
    testResult() {
      return this.$store.state.testResult
    },
    matchesSimilarity() {
      if (
        this.testResult.result &&
        this.testResult.result.FaceMatches.length > 0
      ) {
        return this.testResult.result.FaceMatches[0].Similarity
      }
      return null
    },
    unmatchesSimilarity() {
      if (
        this.testResult.result &&
        this.testResult.result.UnmatchedFaces.length > 0
      ) {
        return this.testResult.result.UnmatchedFaces[0].Confidence
      }
      return null
    }
  },
  watch: {
    'testResult.loading'() {
      if (!this.testResult.loading) {
        this.drawResult()
      }
    }
  },
  mounted() {
    this.result.canvas = this.$refs.canvas
    this.result.canvas.width = this.$refs.container.clientWidth
    this.result.canvas.height = this.$refs.container.clientWidth / 2
    this.result.ctx = this.result.canvas.getContext('2d')
  },
  methods: {
    async drawResult() {
      const imgs = await Promise.all([
        this.loadImage(this.testResult.refImg),
        this.loadImage(this.testResult.targetImg)
      ])
      this.result.ctx.clearRect(
        0,
        0,
        this.result.canvas.width,
        this.result.canvas.height
      )
      imgs.forEach((img, i) => {
        let faceImg = this.testResult.result.SourceImageFace
        if (i > 0) {
          if (this.testResult.result.FaceMatches.length > 0) {
            faceImg = this.testResult.result.FaceMatches[0].Face
          } else {
            faceImg = this.testResult.result.UnmatchedFaces[0]
          }
        }
        const refImgBox = faceImg.BoundingBox
        const px = img.width * refImgBox.Left
        const py = img.width * refImgBox.Top
        const w = img.width * refImgBox.Width
        const h = img.width * refImgBox.Height
        const scaledw = w * (this.result.canvas.height / h)
        const scaledh = this.result.canvas.height
        this.result.ctx.drawImage(
          img,
          px,
          py,
          w,
          h,
          i <= 0 ? 0 : this.result.canvas.width - scaledw,
          0,
          // w / 4,
          // h / 4
          scaledw,
          scaledh
        )
      })
    },
    loadImage(blob) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = window.URL.createObjectURL(blob)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
canvas {
  width: 100%;
  height: auto;
  // touch-action: none;
}
</style>
