<template>
  <div ref="container" class="relative">
    <canvas ref="canvas" tabindex="0"> </canvas>
  </div>
</template>

<script>
const P_TOTAL = 1117

export default {
  name: 'FacesGrid',
  props: {},
  data() {
    return {
      main: { canvas: null, ctx: null }
    }
  },
  mounted() {
    this.main.canvas = this.$refs.canvas
    this.main.canvas.width = 1200
    this.main.canvas.height = 600
    this.main.ctx = this.main.canvas.getContext('2d')
    const l = 75

    const tx = ~~(this.main.canvas.width / l)
    const ty = ~~(this.main.canvas.height / l)
    // random unique ids
    const randomIds = new Set()

    while (randomIds.size < tx * ty) {
      randomIds.add(~~(1 + Math.random() * P_TOTAL))
    }
    const randomImages = [...randomIds]
    let i = 0
    for (let x = 0; x < tx; x++) {
      for (let y = 0; y < ty; y++) {
        this.loadImage(
          `faces/${randomImages[i++]}.jpg`,
          this.main.ctx,
          x * l,
          y * l,
          l,
          l
        )
      }
    }
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
  height: auto;
  background-color: red;
}
</style>
