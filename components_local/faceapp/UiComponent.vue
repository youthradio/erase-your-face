<template>
  <div class="ui-container">
    <!-- <h2>{{ toolsData.name }}</h2>
    <p>{{ toolsData }}</p>

    <h3>Stroke: {{ selectedStrokeWeight }}</h3>
    <h3>Color: {{ selectedColor }}</h3> -->
    <div class="tool-list">
      <div
        class="tool-selection-container"
        :style="
          isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }
        "
      >
        <div class="tool-icon-container">
          <img
            class="tool-icon background-disable"
            :src="require(`../../assets/${toolsData.image}`)"
          />
        </div>
        <div class="tool-icon-container">
          <img
            class="tool-icon background-disable"
            :src="require(`../../assets/${toolsData.image}`)"
          />
        </div>
      </div>
      <div
        class="tool-icon-container"
        :style="
          isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }
        "
      >
        <div
          :class="[toolState.strokeSizeMenu ? 'enabled' : 'hidden']"
          class="strokes"
        >
          <a
            v-for="size in toolsData.strokeWeight.slice().reverse()"
            :key="`key-${size}`"
            href="#"
            @click.prevent="setStrokeWeight(size)"
          >
            <svg :height="size * 2" :width="size * 2">
              <g>
                <circle :cx="size" :cy="size" :r="size" :fill="selectedColor" />
              </g>
            </svg>
          </a>
        </div>
        <a
          :class="[
            'stroke-size-tool',
            toolState.strokeSizeMenu
              ? 'background-enable'
              : 'background-disable'
          ]"
          @click="openStrokeMenu()"
          ><svg height="40" width="40">
            <g>
              <circle
                cx="50%"
                cy="50%"
                :r="selectedStrokeWeight"
                :fill="[toolState.strokeSizeMenu ? 'white' : 'black']"
              />
            </g>
          </svg>
          <div class="">{{ selectedStrokeWeight }}px</div>
        </a>
      </div>
      <div
        class="tool-icon-container color-pick-tool"
        :style="
          isDrawing ? { pointerEvents: 'none' } : { pointerEvents: 'all' }
        "
      >
        <div :class="['', toolState.colorPickerMenu ? 'enabled' : 'hidden']">
          <a
            v-for="color in toolsData.colors"
            :key="color"
            href="#"
            class="color-icon"
            @click.prevent="setColor(color)"
          >
            <svg height="20" width="20">
              <g>
                <circle cx="10" cy="10" r="10" :fill="color" />
              </g>
            </svg>
          </a>
        </div>
        <div class="">
          <svg
            :class="[
              'tool-icon',
              toolState.colorPickerMenu
                ? 'background-enable'
                : 'background-disable'
            ]"
            width="60"
            height="60"
            viewBox="0 0 18 34"
            xmlns="http://www.w3.org/2000/svg"
            @click="openColorMenu()"
          >
            <path
              d="M22.9893 -0.988991C21.6413 -2.337 19.4553 -2.337 18.1073 -0.988991L13.5168 3.60153L12.9338 3.01861C12.6059 2.69072 12.0959 2.69072 11.768 3.01861L11.1851 3.60153C10.8572 3.92943 10.8572 4.43949 11.1851 4.76738L14.209 7.7913L11.768 5.35031L6.08447 11.0702C7.86968 11.2524 9.03552 10.9245 10.1649 10.5602C11.6951 10.0866 13.2617 9.61294 15.7756 10.7059C15.8484 10.7424 15.9213 10.8152 15.9942 10.8516L16.65 10.1959L17.2693 10.8152C17.5972 11.1431 18.1073 11.1431 18.4352 10.8152L19.0181 10.2323C19.346 9.9044 19.346 9.39434 19.0181 9.06644L18.4352 8.48352L22.9893 3.92943C24.3373 2.58142 24.3373 0.35902 22.9893 -0.988991Z"
              :fill="[toolState.colorPickerMenu ? 'white' : 'black']"
            />
            <path
              d="M14.9374 11.9087C13.0793 11.18 11.9863 11.5079 10.6019 11.9087C9.61819 12.2001 8.5252 12.528 7.06789 12.528C6.55784 12.528 5.97491 12.4916 5.31912 12.3823C5.17339 12.3459 5.02766 12.273 4.91836 12.1637L4.26257 12.8924L1.23865 19.851C1.02006 20.3611 1.53012 20.8347 2.00374 20.6525L9.10813 17.7379L14.9374 11.9087Z"
              :fill="[toolState.colorPickerMenu ? 'white' : 'black']"
            />
            <path
              d="M0 26.5173C0 27.6103 0.874386 28.5211 2.0038 28.5211C3.09678 28.5211 4.0076 27.6467 4.0076 26.5173C4.0076 25.4243 2.0038 22.874 2.0038 22.874C2.0038 22.874 0 25.4243 0 26.5173Z"
              :fill="[toolState.colorPickerMenu ? 'white' : 'black']"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainUI',
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
    setColor(color) {
      this.selectedColor = color
      this.$store.dispatch('setUIState', {
        selectedColor: this.selectedColor
      })
    },
    openColorMenu() {
      this.toolState.colorPickerMenu = !this.toolState.colorPickerMenu
    },
    openStrokeMenu() {
      this.toolState.strokeSizeMenu = !this.toolState.strokeSizeMenu
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
.ui-container {
  pointer-events: none;
}
.strokes {
  display: flex;
  align-items: center;
  flex: 1 1;
  a {
    margin: 0.1rem;
    display: inline-flex;
  }
}
.enabled {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 0.5rem;
}

.color-icon {
  height: 20px;
  margin: 0.1rem;
}

.hidden {
  display: none;
}

.tool-icon-container {
  display: flex;
  align-items: center;
}

.tool-selection-container {
  display: flex;
  flex-direction: row;

  .tool-icon-container {
    // padding: 0 0rem 0 0.2rem;
  }
}

.background-disable {
  background-color: #f0f0f0;
  border: 0px solid #f0f0f0;
}

.background-enable {
  background-color: #000;
  border: 0px solid #000;
  color: white;
}

.tool-list {
  display: flex;
  flex-direction: column;
  list-style-type: none;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: flex-end;
  .tool-icon {
    transition: 0.1s;
    max-width: 100%;
    height: 4rem;
    width: 4rem;
    text-align: center;
    border-radius: 100%;
    position: relative;
    border-radius: 50%;
  }
  .stroke-size-tool {
    transition: 0.1s;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: stretch;
    border-radius: 100%;
    height: 4rem;
    width: 4rem;
    margin: 0;
    padding: 0;
  }
  .toolIconEnabled {
    box-shadow: 0px 0px 5px;
  }
  .tool-list-item {
    margin: 0.5rem;
  }
}
</style>
