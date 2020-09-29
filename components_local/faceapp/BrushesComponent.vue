<template>
  <div class="flex flex-column justify-between items-center  baseline-xs">
    <a
      v-for="color in toolsData.colors"
      :key="color"
      href="#"
      class="db mb2 max-width"
      @click.prevent="
        setUIState({
          selectedMode: 'brush',
          selectedColor: color
        })
      "
    >
      <svg
        class="db w-100"
        width="30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 46 46"
        fill="none"
      >
        <circle
          cx="21.301"
          cy="21.313"
          r="20.482"
          :fill="color"
          transform="rotate(-180 21.301 21.313)"
        />
        <g
          v-if="
            color === UIState.selectedColor && UIState.selectedMode === 'brush'
          "
        >
          <circle
            cx="21.301"
            cy="21.313"
            r="20.482"
            :stroke="color === '#FFFFFF' ? '#000' : '#FFF'"
            stroke-width="3"
            transform="rotate(-180 21.301 21.313)"
          />
          <path
            :fill="color === '#FFFFFF' ? '#000' : '#FFF'"
            d="M28.98 14c-.51.016-.995.228-1.35.594-3.108 3.114-5.945 6.168-8.93 9.216l-3.508-2.813a1.964 1.964 0 10-2.454 3.068l4.909 3.928a1.964 1.964 0 002.618-.154c3.532-3.539 6.696-7.015 10.146-10.473A1.963 1.963 0 0028.98 14z"
          />
        </g>
      </svg>
    </a>
    <a
      class="mb2 b white margins tc f7 no-underline max-width"
      href="#"
      @click.prevent="setUIState({ selectedMode: 'eraser' })"
    >
      <svg
        class="db w-100"
        width="30"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 44 40"
      >
        <defs />
        <path
          fill="#fff"
          d="M42.654 13.046c.477-.471.477-1.227 0-1.651L31.913.728c-.477-.472-1.241-.472-1.67 0L.357 30.227c-.477.472-.477 1.227 0 1.652l7.16 7.08c.24.236.526.33.86.33h33.417c.668 0 1.193-.519 1.193-1.18 0-.66-.525-1.133-1.193-1.133H18.403l24.251-23.93zm-11.6-9.817l9.07 8.968-19.811 19.588-9.07-8.968 19.81-19.588zM11.958 36.976H8.855l-5.967-5.9 6.683-6.607 9.07 8.968-3.58 3.54h-3.103z"
        />
        <path
          v-if="UIState.selectedMode === 'eraser'"
          fill="#fff"
          d="M2 31l7.5-7.5 11 10-4.5 5H8L2 31z"
        />
      </svg>
    </a>
    <a
      :style="{ visibility: enableUndoButton > 0 ? 'visible' : 'hidden' }"
      class="mb2 db max-width"
      alt="Undo"
      title="Undo"
      href="#"
      @click.prevent="setUIState({ selectedAction: 'undo' })"
    >
      <UndoButton />
    </a>
    <div class="vertical flex flex-column">
      <div class="w-100 text-order">
        <input
          v-model.number="selectedOpacity"
          class="range db mb4-ns"
          type="range"
          min="0"
          max="1"
          value="1"
          step="0.01"
        />
      </div>
      <span class="db f7 white pv2 pv4-ns tc"><small>OPACITY </small></span>
    </div>
    <!-- <a class="ma1" href="#">
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
            class="b white margins tc f7 no-underline"
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
@import '~@/assets/css/variables';

.svg {
  box-sizing: border-box;
}
.stroke {
  paint-order: stroke;
  stroke: white;
  stroke-width: 15px;
}
.max-width {
  max-width: 1rem;
}

@media #{$breakpoint-not-small} {
  .max-width {
    max-width: 2rem;
  }
}
@media screen and (min-width: 321px) {
  .max-width {
    max-width: 1.2rem;
  }
  .baseline-xs {
    align-items: center !important;
  }
  .vertical {
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    white-space: nowrap;
    display: inline-block;
    overflow: visible;
    // min-height: 3rem;
  }
  .range {
    writing-mode: bt-lr;
    -webkit-appearance: slider-vertical;
    transform: rotate(180deg);
    width: 0.4rem;
    height: 100%;
  }
  .text-order {
    order: 0;
  }
}
.text-order {
  order: 1;
}
.baseline-xs {
  align-items: baseline;
}
</style>
