import Vue from 'vue'
import ScrollMagic from 'scrollmagic'

const PScrollMagic = {
  install(Vue, options) {
    Vue.prototype.$ScrollMagic = {
      Controller: ScrollMagic.Controller,
      Scene: ScrollMagic.Scene,
    }
  },
}
Vue.use(PScrollMagic)

export default PScrollMagic
