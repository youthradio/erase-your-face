<template>
  <div ref="container">
    <h1 v-if="testResult.result">RESULT</h1>
    <h2 v-if="testResult.loading">LOADING</h2>

    <h3>Referece face</h3>
    <canvas ref="refImgCanvas"></canvas>
    <h3>Matching faces</h3>
    <div ref="targetImg" class="flex"></div>
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
    UIState() {
      return this.$store.state.UIState
    },
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
    'UIState.isLoadingResult'() {
      if (!this.testResult.loading) {
        this.drawResult()
      }
    }
  },
  mounted() {},
  methods: {
    async drawResult() {
      const [refImg, targetImg] = await Promise.all([
        this.loadImage(this.testResult.refImg),
        this.loadImage(this.testResult.targetImg)
      ])
      console.log(targetImg)
      const refImgBox = this.testResult.result.SourceImageFace.BoundingBox
      const canvasRef = this.$refs.refImgCanvas
      const canvasRefctx = canvasRef.getContext('2d')

      const px = refImg.width * refImgBox.Left
      const py = refImg.height * refImgBox.Top
      const w = refImg.width * refImgBox.Width
      const h = refImg.height * refImgBox.Height

      canvasRef.width = w
      canvasRef.height = h

      canvasRefctx.drawImage(refImg, px, py, w, h, 0, 0, w, h)

      // imgs.forEach((img, i) => {
      //   let refImgBox = this.testResult.result.SourceImageFace.BoundingBox
      //   if (i > 0) {
      //     if (this.testResult.result.FaceMatches.length > 0) {
      //       faceImg = this.testResult.result.FaceMatches[0].Face
      //     } else {
      //       faceImg = this.testResult.result.UnmatchedFaces[0]
      //     }
      //   }
      //   const refImgBox = faceImg.BoundingBox
      //   const px = img.width * refImgBox.Left
      //   const py = img.width * refImgBox.Top
      //   const w = img.width * refImgBox.Width
      //   const h = img.width * refImgBox.Height
      //   const scaledw = w * (this.result.canvas.height / h)
      //   const scaledh = this.result.canvas.height
      //   this.result.ctx.drawImage(
      //     img,
      //     px,
      //     py,
      //     w,
      //     h,
      //     i <= 0 ? 0 : this.result.canvas.width - scaledw,
      //     0,
      //     // w / 4,
      //     // h / 4
      //     scaledw,
      //     scaledh
      //   )
      // })
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
  display: block;
  width: 100%;
  height: auto;
}
</style>
