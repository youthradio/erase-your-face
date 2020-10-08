<template>
  <div ref="container">
    <h5 class="roboto-mono green b ttu ma0 pl2">RESULTS</h5>
    <div class="flex mh ph2">
      <div class="w-30 w-50-ns pa2-ns">
        <template v-if="isLoadingResult">
          <h3 class="mt0 lh-title f6 f5-ns mt0">
            Loading...
          </h3>
        </template>
        <template v-else-if="testResult.result && testResult.result.error">
          <h3 class="mt0 lh-title f6 f5-ns ma0">
            No face detected on reference image
          </h3>
        </template>
        <template v-else-if="testResult.result">
          <h3 class="lh-title f6 f5-ns mt0">
            Face detected
          </h3>
        </template>
        <template v-else>
          <h3 class="lh-title f6 f5-ns mt0">
            ▮▮▮▮▮▮ ▮▮▮ ▮▮▮▮ ▮▮▮▮
          </h3>
        </template>

        <svg
          v-if="isFirstTime"
          class="svg-grey pa"
          width="200"
          viewBox="10 0 50 50"
        >
          <rect fill="lightgray" width="40" height="40"></rect>
        </svg>
        <canvas v-else ref="refImgCanvas" class=""></canvas>
      </div>
      <div class="w-70 w-50-ns flex flex-column justify-between pa2-ns">
        <div>
          <template v-if="isLoadingResult">
            <h3 class="lh-title f6 f5-ns ma0">
              Loading...
            </h3>
            <h4 class="mt0 lh-title f7 f6-ns normal">
              Loading...
            </h4>
          </template>
          <template v-else-if="testResult.result">
            <h3 class="lh-title f6 f5-ns ma0">
              {{ faceMatches.length > 0 ? faceMatches.length : 'No' }} Matching
              {{ faceMatches.length > 1 ? 'Faces' : 'Face' }}
            </h3>
            <h4
              v-if="faceMatches.length > 0"
              class="mt0 lh-title f7 f6-ns normal"
            >
              with similarity score
            </h4>
          </template>
          <template v-else>
            <h3 class="lh-title f6 f5-ns mt0">
              ▮▮▮▮▮▮ ▮▮▮ ▮▮▮▮ ▮▮▮▮
            </h3>
          </template>
          <div ref="faceMatches" class="flex flex-wrap">
            <template v-for="i in fakeSvgsCounter">
              <div :key="i" class="flex flex-column justify-between">
                <svg class="svg-grey pa" width="40" viewBox="10 0 50 60">
                  <rect fill="lightgray" width="50" height="60"></rect>
                </svg>
                <h3 class="lh-title f7 mt0">▮▮▮▮</h3>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <h3 v-if="testResult && testResult.error">{{ testResult.error }}</h3>
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
    fakeSvgsCounter() {
      if (process.client && window.innerWidth > 700) {
        return Array(6)
      }
      return Array(4)
    },
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
        if (window.innerWidth > 700) {
          return this.testResult.result.FaceMatches.slice(0, 6)
        } else {
          return this.testResult.result.FaceMatches.slice(0, 4)
        }
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

      canvasRef.width = 200
      canvasRef.height = 200
      canvasRefctx.drawImage(refImg, px, py, w, h, 0, (200 - h) / 2, w, h)

      while (this.$refs.faceMatches.firstChild) {
        this.$refs.faceMatches.removeChild(this.$refs.faceMatches.firstChild)
      }
      this.faceMatches.forEach((match) => {
        const div = document.createElement('div')
        const label = document.createElement('div')
        div.className = 'flex flex-column justify-between '
        label.className = ''
        label.innerHTML = `<h3 class="lh-title f7 mt0">${match.Similarity.toFixed(
          2
        )}%</h3>`
        const canvas = document.createElement('canvas')
        const canvasCtx = canvas.getContext('2d')

        const matchImgBox = match.Face.BoundingBox

        const px = targetImg.width * matchImgBox.Left
        const py = targetImg.height * matchImgBox.Top
        const w = targetImg.width * matchImgBox.Width
        const h = targetImg.height * matchImgBox.Height
        canvas.width = 60
        canvas.height = 70
        canvas.style.width = '100%'
        canvasCtx.drawImage(targetImg, px, py, w, h, 0, (70 - h) / 2, w, h)
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
.svg-grey {
  display: block;
  width: 100%;
  height: auto;
}
</style>
