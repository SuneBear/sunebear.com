import Vue from 'vue'

import resize from 'vue-resize-directive'
Vue.directive('resize', resize)

// @Source: https://github.com/rodneyrehm/viewport-units-buggyfill
// import vhCheck from 'vh-check'
// vhCheck()

// @Source: https://github.com/shentao/vue-global-events
import GlobalEvents from 'vue-global-events'
Vue.component('GlobalEvents', GlobalEvents)

export default (context) => {

}
