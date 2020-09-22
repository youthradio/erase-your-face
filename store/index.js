import data from './data'

export const state = () => ({
  UIState: {
    selectedColor: null,
    selectedOpacity: null,
    selectedStrokeWeight: null,
    selectedAction: null,
    isDrawing: null,
    selectedMode: null,
    isLoadingResult: false
  },
  progress: null,
  toolsData: null,
  testResult: {
    loading: null,
    result: null,
    error: null,
    targetImg: null,
    refImg: null
  }
})

export const actions = {
  loadStore({ commit }) {
    commit('LOAD_STORE')
  },
  setUIState({ commit }, newstate) {
    commit('SET_UISTATE', newstate)
  },
  // set current progress UI state
  setProgressState({ commit }, newstate) {
    commit('SET_PROGSTATE', newstate)
  },
  setResultState({ commit }, newstate) {
    commit('SET_RESULT', newstate)
  }
}
export const mutations = {
  LOAD_STORE(state) {
    state.toolsData = Object.assign({}, data.toolsData)
    state.UIState.selectedAction = 'none'
    state.UIState.selectedMode = 'brush'
    state.UIState.selectedColor = state.toolsData.colors[4]
    state.UIState.selectedOpacity = 1.0
    state.UIState.isDrawing = false

    state.UIState.selectedStrokeWeight = state.toolsData.strokeWeight[3]
    state.progresss = 'imageSelection'
    state.testResult.loading = false
  },
  SET_UISTATE(state, newstate) {
    state.UIState = Object.assign(state.UIState, newstate)
  },
  SET_PROGSTATE(state, newstate) {
    state.progress = newstate
  },
  SET_RESULT(state, newstate) {
    state.testResult = Object.assign(state.testResult, newstate)
  }
}
