import Vue from 'vue'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

import { math } from '~/utils/math'
import AttentionIndicator from '~/components/widgets/attention-indicator.vue'
import MessageBubblePopover from '~/components/widgets/message-bubble-popover.vue'

// @TODO: Bind component transition to object lifecycle
export class Vue2DObject extends CSS2DObject {

  constructor(_options) {
    const options = {
      Component: null,
      props: {},
      ..._options
    }

    if (!options.Component) {
      console.log('[Vue2DObject] Component was undefined')
    }

    const Component = Vue.extend(options.Component)

    const $objectVM = new Component({
      propsData: options.props
    })

    if (options.text) {
      $objectVM.$slots.default = [ options.text ]
    }

    $objectVM.$mount()

    super($objectVM.$el)

    this.$objectVM = $objectVM
  }

}

export class AttentionIndicatorObject extends Vue2DObject {
  constructor(props) {
    const options = {
      Component: AttentionIndicator,
      props
    }
    super(options)
  }
}

const messageObjectInstanceMap = {}

export class BubbleMessageObject extends Vue2DObject {
  constructor(props, container) {
    // @FIXME: Avoid multiple calls
    const onAfterLeave = () =>{
      this.removeFromParent()
      delete messageObjectInstanceMap[props.message]
      this.$objectVM.$destroy(true)
    }
    const duration = math.clamp(props.message.length * 300, 3000, 10000)

    const options = {
      Component: MessageBubblePopover,
      props: {
        onAfterLeave,
        duration,
        ...props
      }
    }

    super(options)

    this.name = 'bubbleMessage'

    // @hack: make message singleton
    if (messageObjectInstanceMap[props.message]) {
      return this
    }

    messageObjectInstanceMap[props.message] = this

    if (container && !container.getObjectByName(this.name)) {
      container.add(this)
    }
  }

  hide() {
    this.$objectVM.visible = false
  }
}
