<template>
  <div class="flex flex-column justify-between items-center">
    <a
      v-for="color in toolsData.colors"
      :key="color"
      href="#"
      class="db grow"
      @click.prevent="
        setUIState({
          selectedMode: 'brush',
          selectedColor: color
        })
      "
    >
      <svg class="db mb1 w-100" width="30" viewBox="0 0 39 38">
        <path
          d="M19.5 36.5C9.5219 36.5 1.5 28.6285 1.5 19C1.5 9.37151
              9.52191 1.5 19.5 1.5C29.4781 1.5 37.5 9.37151 37.5 19C37.5 28.6285
              29.4781 36.5 19.5 36.5Z"
          :fill="color"
          :stroke="color === UIState.selectedColor ? '' : 'lightgray'"
          stroke-width="3"
        />
      </svg>
    </a>
    <a
      class="mb1 b white margins tc f7 no-underline grow"
      href="#"
      @click.prevent="setUIState({ selectedMode: 'eraser' })"
    >
      <svg
        class="db w-100"
        width="30"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 23 21"
      >
        <path
          fill="#fff"
          stroke="#fff"
          stroke-width=".25"
          d="M21.913 7.276h0c.279-.276.287-.726-.002-.986l-5.242-5.206h0c-.278-.275-.732-.283-.994.002l-14.588 14.4h0c-.279.276-.287.727.002.987l3.494 3.455a.69.69 0 00.507.197H21.406a.699.699 0 00.707-.701c0-.4-.32-.678-.707-.678H10.29l11.623-11.47zM6.667 11.957l9.495-9.387 4.25 4.203-9.495 9.387-4.25-4.203zm.172 6.789H5.375L2.588 15.99l3.085-3.05 4.25 4.202-1.62 1.604H6.838z"
        />
      </svg>
    </a>
    <a
      :style="{ visibility: enableUndoButton > 0 ? 'visible' : 'hidden' }"
      class="mb1 db grow"
      alt="Undo"
      title="Undo"
      href="#"
      @click.prevent="setUIState({ selectedAction: 'undo' })"
    >
      <UndoButton />
    </a>
    <div class="relative">
      <div class="vertical mt2 mt4-ns">
        <input
          v-model.number="selectedOpacity"
          class="range db mb4-ns"
          type="range"
          min="0"
          max="1"
          value="1"
          step="0.01"
        />
        <span class="f7 white">OPACITY </span>
      </div>
    </div>
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
import UndoButton from './UndoButton.vue'

export default {
  name: 'BrushesComponent',
  components: {
    UndoButton
  },
  props: {
    enableUndoButton: {
      type: Boolean,
      required: true,
      default: false
    }
  },
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
      this.setUIState({ selectedOpacity: this.selectedOpacity })
    }
  },
  methods: {
    setUIState(state) {
      this.$store.dispatch('setUIState', { ...state })
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

.vertical {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
  overflow: visible;
}
.range {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  transform: rotate(180deg);
  width: 0.5rem;
  height: 100%;
  min-height: 3rem;
}
</style>
