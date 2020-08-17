<template>
  <div>
    <SelectionScreen />
    <!-- <MainUI /> -->
    <Canvas />
    <BottomUi />
    <ResultScreen />
  </div>
</template>

<script>
import Canvas from './faceapp/Canvas.vue'
import BottomUi from './faceapp/BottomUi.vue'
import SelectionScreen from './faceapp/SelectionScreen.vue'
import ResultScreen from './faceapp/ResultScreen.vue'

export default {
  name: 'FaceApp',
  components: {
    // MainUI,
    Canvas,
    BottomUi,
    SelectionScreen,
    ResultScreen
  },
  computed: {},
  created() {
    this.$store.dispatch('loadStore')
  }
}
</script>

<style scoped></style>
