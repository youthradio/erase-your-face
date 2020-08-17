<template>
  <div class="image-select-screen">
    <div class="flex">
      <div
        v-for="image in referenceImages"
        :key="image.name"
        :class="[
          'image-select-item',
          {
            selected:
              selectedReferenceImg && selectedReferenceImg.name === image.name
          }
        ]"
      >
        <a tabindex="0" href="#" @click.prevent="setSelection(image)">
          <img class="img-fluid" :src="require(`../../assets/${image.src}`)" />
        </a>
      </div>
    </div>
    <button @click="finishSelection()">Next</button>
  </div>
</template>

<!-- line 11 errors out on mount because there is no image to refer to, needs to be applied after load -->

<script>
export default {
  name: 'SelectionScreen',
  props: {},
  data() {
    return {
      selectedReferenceImg: null,
      pictureBase: []
    }
  },
  computed: {
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
    },
    finishSelection() {
      this.timeline.imageSelect = true
    }
  }
}
</script>
<style lang="scss" scoped>
.image-select-container {
  display: flex;
  flex-direction: row;
}
.image-select-item {
  // position: relative;
  // flex: 2;
  // margin: 0.4rem;
}

.selected {
  outline: 5px solid black;
  z-index: 1;
}
.img-fluid {
  width: 100%;
  height: auto;
}
</style>
