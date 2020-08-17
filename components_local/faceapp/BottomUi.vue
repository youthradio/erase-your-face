<template>
  <div class="save-button-root">
    <button @click="setActionState('undo')">UNDO</button>
    <button @click="setActionState('test-image')">TEST</button>
  </div>
</template>

<script>
export default {
  name: 'SavePicture',
  props: {},
  methods: {
    setActionState(state) {
      this.$store.dispatch('setUIState', {
        selectedAction: state
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.save-button-root {
  display: flex;
  justify-content: center;
}
</style>
