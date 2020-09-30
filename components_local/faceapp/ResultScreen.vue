<template>
  <div v-if="!isLoadingResult && !isFirstTime" ref="container">
    <h3 v-if="testResult.result" class="roboto-mono green b ttu">RESULTS</h3>
    <div class="flex flex-wrap">
      <div class="w-40">
        <template v-if="testResult.result.error">
          <h3 class="mt0 lh-title f6 f5-ns mt0">
            No face detected on reference image
          </h3>
        </template>
        <template v-else>
          <h3 class="lh-title f6 f5-ns mt0">
            Reference face detected
          </h3></template
        >
        <canvas ref="refImgCanvas"></canvas>
      </div>
      <div class="w-60-ns w-100 pl1 pl4-ns flex flex-column justify-between">
        <div>
          <h3 class="lh-title f6 f5-ns mt0">
            {{ faceMatches.length > 0 ? faceMatches.length : 'No' }} Matching
            {{ faceMatches.length > 1 ? 'Faces' : 'Face' }}
          </h3>
          <h4
            v-if="faceMatches.length > 0"
            class="mt0 lh-title f7 f6-ns normal"
          >
            with similarity score
          </h4>
          <div ref="faceMatches" class="flex flex-wrap nl1"></div>
        </div>
        <div class="flex justify-end self-end">
          <a
            class="roboto-mono pv1 ph2 ba br-pill bw1 b tc f7 f5-ns no-underline b--white grow green bg-white grow shadow-3"
            href="#"
            @click.prevent="setUIState({ selectedAction: 'try-again' })"
          >
            TRY AGAIN
          </a>
        </div>
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
      if (this.testResult.result && !this.testResult.result.error) {
        return this.testResult.result.FaceMatches
      }
      return []
    }
  },
  watch: {
    async 'UIState.isLoadingResult'() {
      if (!this.UIState.isLoadingResult) {
        this.isFirstTime = false
        if (this.testResult) {
          await this.drawResult()
        }
      }
    }
  },
  mounted() {},
  methods: {
    async drawResult() {
      if (this.testResult.result.error) return
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
        const label = document.createElement('div')
        div.className = 'flex flex-column justify-between ph1'
        label.className = ''
        label.innerHTML = `<h3 class="lh-title f7 mt0 tc">${match.Similarity.toFixed(
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
        canvasCtx.drawImage(targetImg, px, py, w, h, 0, 0, w, h)
        div.appendChild(canvas)
        div.appendChild(label)

        this.$refs.faceMatches.appendChild(div)
      })
    },
    loadImage(blob) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = window.URL.createObjectURL(blob)
      })
    },
    setUIState(state) {
      this.$store.dispatch('setUIState', { ...state })
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
