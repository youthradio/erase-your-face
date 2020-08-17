import data from './data'

export const state = () => ({
  UIState: {
    selectedColor: null,
    selectedStrokeWeight: null,
    selectedReferenceImg: null,
    selectedAction: null,
    isDrawing: null
  },
  progress: null,
  toolsData: null,
  referenceImages: null,
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
    state.referenceImages = data.referenceImages.slice()
    state.UIState.selectedAction = 'none'
    state.UIState.selectedColor = state.toolsData.colors[7]
    state.UIState.selectedStrokeWeight = state.toolsData.strokeWeight[3]
    state.UIState.selectedReferenceImg = state.referenceImages[0]
    state.UIState.isDrawing = false
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
