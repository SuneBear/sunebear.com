<template lang="pug">
el-popover(
  v-model="visible"
  :trigger="trigger"
  :width="width"
  :placement="placement"
  @mouseenter.native="clearTimer"
  @mouseleave.native="startTimer"
  @after-leave="handleAfterLeave"
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

export default {
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

    width: {
      type: Number,
      default: 100
    },

    trigger: {
      type: String,
      default: 'manual'
    },

    onAfterLeave: {
      type: Function
    }
  },

  model: {
    prop: 'visible'
  },

  mounted() {
    if (this.autoPlay) {
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

    handleAfterLeave() {
      if (typeof this.onAfterLeave === 'function') {
        this.onAfterLeave(this)
      }
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
