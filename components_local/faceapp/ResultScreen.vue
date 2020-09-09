<template>
  <div v-if="!isLoadingResult && !isFirstTime" ref="container">
    <h1 v-if="testResult.result" id="result" ref="result">RESULT</h1>
    <h2 v-if="testResult.loading">LOADING</h2>
    <div class="flex">
      <div class="w-40 ph1">
        <h3 class="lh-title f5 f4-ns">Reference face</h3>
        <canvas ref="refImgCanvas"></canvas>
      </div>
      <div class="w-60 ph1">
        <h3 class="lh-title f5 f4-ns">
          {{ faceMatches.length > 0 ? faceMatches.length : 'No' }} Matching
          faces
        </h3>
        <div ref="faceMatches" class="flex justify-around flex-wrap"></div>
      </div>
    </div>
    <h3 v-if="testResult.error">{{ testResult.error }}</h3>
  </div>
</template>

<script>
export default {
  name: 'ResultScreen',
  props: {},
  data() {
    return {
      isFirstTime: true,
      result: {
        canvas: null,
        ctx: null
      }
    }
  },
  computed: {
    isLoadingResult() {
      return this.UIState.isLoadingResult
    },
    UIState() {
      return this.$store.state.UIState
    },
    testResult() {
      if (this.$store.state.testResult) {
        return this.$store.state.testResult
      }
      return null
    },
    faceMatches() {
      if (this.testResult.result) {
        return this.testResult.result.FaceMatches
      }
      return []
    }
  },
  watch: {
    async 'UIState.isLoadingResult'() {
      if (!this.UIState.isLoadingResult) {
        this.isFirstTime = false
        await this.drawResult()
        this.$refs.container.scrollIntoView({ behavior: 'smooth' })
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

      while (this.$refs.faceMatches.firstChild) {
        this.$refs.faceMatches.removeChild(this.$refs.faceMatches.firstChild)
      }
      this.faceMatches.forEach((match) => {
        const div = document.createElement('div')
        div.className = 'ph2'
        div.innerHTML = `<h3 class="lh-title f5">${match.Similarity.toFixed(
          2
        )}%</h3>`
        const canvas = document.createElement('canvas')
        const canvasCtx = canvas.getContext('2d')

        const matchImgBox = match.Face.BoundingBox

        const px = targetImg.width * matchImgBox.Left
        const py = targetImg.height * matchImgBox.Top
        const w = targetImg.width * matchImgBox.Width
        const h = targetImg.height * matchImgBox.Height
        canvas.width = w
        canvas.height = h
        canvas.style.width = '100%'
        canvas.style.maxWidth = '60px'
        canvasCtx.drawImage(targetImg, px, py, w, h, 0, 0, w, h)
        div.appendChild(canvas)
        this.$refs.faceMatches.appendChild(div)
      })
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
[id]::before {
  content: '';
  display: block;
  height: 69px;
  margin-top: -69px;
  visibility: hidden;
}
</style>
