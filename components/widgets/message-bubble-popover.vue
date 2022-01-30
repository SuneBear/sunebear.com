<template lang="pug">
el-popover(
  v-model="visible"
  ref="elPopover"
  :trigger="trigger"
  :width="width"
  :placement="placement"
  @mouseenter.native="clearTimer"
  @mouseleave.native="startTimer"
  @show="handleShow"
  @after-leave="handleAfterLeave"
  :popper-options="popperOptions"
  popper-class="message-bubble-popover"
)
  cear-message-bubble(
    :message="message"
  )
  slot(
    slot="reference"
  )
</template>

<script>
import CearMessageBubble from '../cear-ui/cear-message-bubble'
import ticker from '~/mixins/ticker'

export default {
  mixins: [
    ticker
  ],

  props: {
    ...CearMessageBubble.props,

    placement: {
      type: String,
      default: 'top'
    },

    visible: {
      type: Boolean,
      default: false
    },

    autoPlay: {
      type: Boolean,
      default: true
    },

    needScheduleUpdate: {
      type: Boolean,
      default: false
    },

    width: {
      type: Number,
      default: 200
    },

    trigger: {
      type: String,
      default: 'manual'
    },

    onAfterLeave: {
      type: Function
    },

    // @REF: https://github.com/ElemeFE/element/blob/dev/src/utils/popper.js#L50
    // @docs: https://popper.js.org/docs/v1/
    popperOptions: {
      type: Object,
      default: () => ({
        modifiersIgnored: [ 'preventOverflow', 'flip' ]
      })
    }
  },

  model: {
    prop: 'visible'
  },

  data() {
    return {
      enableTicker: this.needScheduleUpdate
    }
  },

  watch: {
    message() {
      if (this.message) {
        this.show()
      } else {
        this.close()
      }
    }
  },

  mounted() {
    if (this.autoPlay) {
      this.$emit('input', true)
      this.visible = true
    }
    this.startTimer()
  },

  activated() {
    this.startTimer()
    if (typeof this.lastVisible !== 'undefined') {
      this.visible = this.lastVisible
    }
  },

  deactivated() {
    this.lastVisible = this.visible
    this.visible = false
    this.clearTimer()
  },

  methods: {
    startTimer() {
      if (!this.visible || this.timer) {
        return
      }

      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close()
          }
          this.timer = null
        }, this.duration)
      }
    },

    onTick() {
      const { elPopover } = this.$refs
      if (this.needScheduleUpdate && elPopover && elPopover.popperJS) {
        elPopover.popperJS.update()
      }
    },

    handleShow() {
      this.startTick()
    },

    handleAfterLeave() {
      this.stopTick()
      if (typeof this.onAfterLeave === 'function') {
        this.onAfterLeave(this)
      }
    },

    show() {
      this.clearTimer()
      this.$emit('input', true)
      this.visible = true
      this.startTimer()
    },

    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },

    close() {
      this.$emit('input', false)
      this.visible = false
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    }
  }

}
</script>

<style lang="stylus">
// @TODO: Update transition, add arrow & adjust style
.el-popover.message-bubble-popover
  min-width: s('min(300px, 80vw)')
  padding: 0
  border: none
  background: transparent
  box-shadow: none
  text-align: initial

  .cear-message-bubble
    justify-content: center

    .cear-notation.type-highlight
      padding: 0

    .bubble-body
      padding: 7px 14px

    .readable-render
      line-height: 1.6
      font-size: 13px

    .bubble-bg
      position relative

      &:before
        content: ''
        position: absolute
        width: 0px
        height: 0px
        border-top: 5px solid #fff
        border-left: 5px solid #fff
        border-right: 5px solid transparent
        border-bottom: 5px solid transparent
        bottom: -8px
        left: 50%
        z-index: 2
</style>
