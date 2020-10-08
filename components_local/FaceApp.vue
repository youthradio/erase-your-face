<template>
  <div class="full-width mw9">
    <Canvas />
  </div>
</template>

<script>
import Canvas from './faceapp/Canvas.vue'

export default {
  name: 'FaceApp',
  components: {
    Canvas
  },
  computed: {},
  created() {
    this.$store.dispatch('loadStore')
  }
}
</script>

<style scoped lang="scss">
.full-width {
  margin-left: calc(max(-100vw, -64rem) / 2 + 100% / 2);
  margin-right: calc(max(-100vw, -64rem) / 2 + 100% / 2);
}
</style>
