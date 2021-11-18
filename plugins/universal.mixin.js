import Vue from 'vue'
import { isSafari } from '~/utils/env'

const pageMixin = {

  data() {
    return {
      paperName: 'solar-dotted',
      isSafari: isSafari(),
      isShowHeader: true,
      isShowFooter: false
    }
  }

}

Vue.mixin(pageMixin)
