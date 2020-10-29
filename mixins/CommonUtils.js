export default {
  data() {
    return {
      _mixingDebouceTimer: null,
    }
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading
    },
  },
  methods: {
    debouceEvent(event, callback) {
      if (this._mixingDebouceTimer) {
        window.cancelAnimationFrame(this._mixingDebouceTimer)
      }
      this._mixingDebouceTimer = window.requestAnimationFrame(() =>
        callback(event)
      )
    },
  },
}
