<template>
  <div class="pointer-events-none min-content">
    <div class="tool-list">
      <div
        class=""
        :style="
          isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }
        "
      ></div>
      <div
        :style="
          isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }
        "
      >
        <div class="flex flex-column">
          <a
            v-for="color in toolsData.colors"
            :key="color"
            href="#"
            class="ma1 grow"
            @click.prevent="setColor(color)"
          >
            <svg class="db w-100" width="20" viewBox="0 0 39 38" fill="none">
              <path
                d="M19.5 36.5C9.5219 36.5 1.5 28.6285 1.5 19C1.5 9.37151
              9.52191 1.5 19.5 1.5C29.4781 1.5 37.5 9.37151 37.5 19C37.5 28.6285
              29.4781 36.5 19.5 36.5Z"
                :fill="color"
                :stroke="color === selectedColor ? '' : 'white'"
                stroke-width="3"
              />
            </svg>
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
          </a> -->
          <a
            class="b white ma1 tc f7 no-underline grow"
            href="#"
            @click.prevent="setActionState('undo')"
          >
            <small>UNDO</small>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrushesComponent',
  props: {},
  data() {
    return {
      selectedColor: null,
      selectedStrokeWeight: null,
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
  created() {
    this.selectedColor = this.UIState.selectedColor
    this.selectedStrokeWeight = this.UIState.selectedStrokeWeight
  },
  methods: {
    setActionState(state) {
      this.$store.dispatch('setUIState', {
        selectedAction: state
      })
    },
    setColor(color) {
      this.selectedColor = color
      this.$store.dispatch('setUIState', {
        selectedColor: this.selectedColor
      })
    },
    setStrokeWeight(stroke) {
      // would this be to send to the store?
      this.selectedStrokeWeight = stroke
      this.$store.dispatch('setUIState', {
        selectedStrokeWeight: this.selectedStrokeWeight
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
