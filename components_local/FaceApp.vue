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

<style scoped lang="scss"></style>
