import Vue from 'vue'
import ClickEffect from './click-effect.vue'

const InstanceConstructor = Vue.extend(ClickEffect)
let lastEmitTime = Date.now()

export const emitClickEffect = (_options) => {
  const options = {
    x: 0,
    y: 0,
    throttle: 200,
    type: 'plus-ones',
    ..._options
  }

  const now = Date.now()

  if (now - lastEmitTime < options.throttle) {
    return
  }

  lastEmitTime = now

  const instance = new InstanceConstructor({
    propsData: options
  })

  instance.$mount()

  document.body.appendChild(instance.$el)
}
