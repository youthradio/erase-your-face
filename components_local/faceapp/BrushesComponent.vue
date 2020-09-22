<template>
  <div class="flex justify-between items-end">
    <a
      v-for="color in toolsData.colors"
      :key="color"
      href="#"
      class="db grow"
      @click.prevent="setColor(color)"
    >
      <svg class="db mr1" height="25" viewBox="0 0 39 38">
        <path
          d="M19.5 36.5C9.5219 36.5 1.5 28.6285 1.5 19C1.5 9.37151
              9.52191 1.5 19.5 1.5C29.4781 1.5 37.5 9.37151 37.5 19C37.5 28.6285
              29.4781 36.5 19.5 36.5Z"
          :fill="color"
          :stroke="color === UIState.selectedColor ? '' : 'lightgray'"
          stroke-width="2"
        />
      </svg>
    </a>
    <div class="ph2">
      <span class="f7 white"> opacity </span>
      <input
        v-model.number="selectedOpacity"
        class="db w-100"
        type="range"
        min="0"
        max="1"
        value="1"
        step="0.01"
      />
    </div>
    <a
      class="b white margins tc f7 no-underline grow"
      href="#"
      @click.prevent="setMode('eraser')"
    >
      <small>ERASER</small>
    </a>
    <!-- <a class="ma1 grow" href="#">
            <svg
              class="db w-100"
              width="20"
              viewBox="0 0 39 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="19.0668"
                cy="19.5112"
                r="17.5668"
                stroke="white"
                stroke-width="3"
              />
              <mask
                id="mask0"
                mask-type="alpha"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="39"
                height="39"
              >
                <circle
                  cx="19.0668"
                  cy="19.5112"
                  r="18.5668"
                  fill="white"
                  stroke="black"
                />
              </mask>
              <g mask="url(#mask0)">
                <path
                  d="M11.9168 -9.08911V16.5319M11.9168 16.5319V27.6404C11.9168 28.7449 12.8122 29.6404 13.9168 29.6404H24.5148C25.6194 29.6404 26.5148 28.7449 26.5148 27.6404V16.5319M11.9168 16.5319H26.5148M26.5148 -9.08911V16.5319"
                  stroke="white"
                  stroke-width="3"
                />
              </g>
            </svg>
          </a>
          <a
            class="b white margins tc f7 no-underline grow"
            href="#"
            @click.prevent="setActionState('undo')"
          >
            <small>UNDO</small>
          </a>
          -->
  </div>
</template>

<script>
export default {
  name: 'BrushesComponent',
  props: {},
  data() {
    return {
      selectedOpacity: 1,
      toolState: {
        strokeSizeMenu: false,
        colorPickerMenu: false
      }
    }
  },
  computed: {
    toolsData() {
      return this.$store.state.toolsData
    },
    UIState() {
      return this.$store.state.UIState
    },
    isDrawing() {
      return this.$store.state.UIState.isDrawing
    },
    setToolStyle() {
      return {}
    }
  },
  watch: {
    selectedOpacity() {
      this.setOpacity(this.selectedOpacity)
    }
  },
  methods: {
    setActionState(state) {
      this.$store.dispatch('setUIState', {
        selectedAction: state
      })
    },
    setColor(color) {
      this.$store.dispatch('setUIState', {
        selectedMode: 'brush',
        selectedColor: color
      })
    },
    setMode(mode) {
      this.$store.dispatch('setUIState', {
        selectedMode: mode
      })
    },
    setOpacity(opacity) {
      this.$store.dispatch('setUIState', {
        selectedMode: 'brush',
        selectedOpacity: opacity
      })
    },
    setStrokeWeight(stroke) {
      // would this be to send to the store?
      this.$store.dispatch('setUIState', {
        selectedMode: 'brush',
        selectedStrokeWeight: stroke
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.svg {
  box-sizing: border-box;
}
.stroke {
  paint-order: stroke;
  stroke: white;
  stroke-width: 15px;
}
</style>
