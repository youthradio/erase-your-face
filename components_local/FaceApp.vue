<template>
  <div>
    <Canvas />
    <ResultScreen />
  </div>
</template>

<script>
import Canvas from './faceapp/Canvas.vue'
import ResultScreen from './faceapp/ResultScreen.vue'

export default {
  name: 'FaceApp',
  components: {
    Canvas,
    ResultScreen
  },
  computed: {},
  created() {
    this.$store.dispatch('loadStore')
  }
}
</script>

<style scoped lang="scss">
.full-width {
  margin-left: calc(-100vw / 2 + 100% / 2);
  margin-right: calc(-100vw / 2 + 100% / 2);
}
</style>
