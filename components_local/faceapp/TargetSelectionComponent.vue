<template>
  <div class="flex">
    <div
      v-for="image in referenceImages"
      :key="image.name"
      :class="[
        'w33',
        {
          selected:
            selectedReferenceImg && selectedReferenceImg.name === image.name
        }
      ]"
    >
      <a tabindex="0" href="#" @click.prevent="setSelection(image)">
        <img class="db w-100" :src="image.src" />
      </a>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TargetSelectionComponent',
  props: {},
  data() {
    return {
      selectedReferenceImg: null,
      pictureBase: []
    }
  },
  computed: {
    // array with objects carrying refere image info { name, source, targe}
    referenceImages() {
      return this.$store.state.referenceImages
    },
    UIState() {
      return this.$store.state.UIState
    },
    timeline() {
      return this.$store.state.timeline
    }
  },
  mounted() {
    this.selectedReferenceImg = this.UIState.selectedReferenceImg
  },
  methods: {
    setSelection(image) {
      this.selectedReferenceImg = image
      this.$store.dispatch('setUIState', {
        selectedReferenceImg: this.selectedReferenceImg
      })
      this.$store.dispatch('setProgressState', 'canvasDrawing')
    }
  }
}
</script>
<style lang="scss" scoped>
.selected {
  outline: 5px solid goldenrod;
  outline-offset: -5px;
  z-index: 1;
}
.w33 {
  width: calc(100% / 3);
}
</style>
