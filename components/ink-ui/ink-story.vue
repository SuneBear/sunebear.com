<template lang="pug">
.ink-story
  .story-viewport(
    ref="viewport"
    :class="[{ 'scrollable-y': scrollHeight}, this.needAnimate ? 'hide-scrollbar' : 'brand-scrollbar' ]"
    :style="{ height: scrollHeight }"
  )
    .d-flex.flex-column
      ink-message-bubble(
        v-for="(message, index) in finalMessages"
        :key="message.id || index"
        v-bind="message"
      )
</template>

<script>
import anime from 'animejs'
import { math } from '~/utils/math'

// @TODO: Optimize list animation
// @TODO: add manulSwitchNext button
export default {

  props: {
    needAnimate: {
      type: Boolean,
      default: true
    },

    // @props
    // - ...message.user,
    // - isMe: Boolean
    // - isSystem: Boolean
    // - isDefault: Boolean
    roles: {
      type: Array,
      default: () => []
    },

    initialMessages: {
      type: Array,
      default: () => []
    },

    messageOptions: {
      type: Object
    },

    autoScrollToBottom: {
      type: Boolean,
      default: true
    },

    scrollHeight: {
      type: String
    },

    maxLength: {
      type: Number
    }
  },

  data() {
    return {
      nextMessages: [],
      currentMessages: []
    }
  },

  computed: {
    currentMessageRaw() {
      return this.finalMessages.slice(0, -1)[0]
    },

    finalMessages() {
      if (this.maxLength) {
        return this.currentMessages.slice(Math.max(this.currentMessages.length - this.maxLength, 0))
      }

      return this.currentMessages
    },

    hasFinished() {
      if (!this.needAnimate) {
        return true
      }

      return this.nextMessages.length === 0
    },

    defauleRole() {
      return this.roles.find(role => role.isDefault)
    }
  },

  watch: {
    currentMessages() {
      if (this.autoScrollToBottom) {
        setTimeout(() => {
          this.scrollToBottom()
        })
      }
    }
  },

  mounted() {
    this.playAnimerMap = {}
    this.initData()
  },

  methods: {
    initData() {
      if (!this.needAnimate) {
        this.currentMessages = [
          ...this.currentMessages,
          ...this.initialMessages.map(message => this.formatMessageData({
            ...message,
            status: 'sent'
          }))
        ]
      } else {
        this.nextMessages = [
          ...this.nextMessages,
          ...this.initialMessages.map(this.formatMessageData)
        ]
        this.switchNext()
      }
    },

    scrollToBottom() {
      if (this.scrollAnimer) {
        this.scrollAnimer.pause()
      }

      const $target = this.$refs.viewport
      const scrollTop = math.clamp($target.scrollHeight - $target.scrollTop, 0, $target.scrollHeight)

      this.scrollAnimer = anime({
        targets: $target,
        scrollTop: `+=${scrollTop}`,
        duration: this.needAnimate ? math.clamp(scrollTop * 2, 1000, 2000) : 200,
        easing: 'linear',
        complete: () => {
          this.scrollAnimer = null
        }
      })
    },

    switchNext(force) {
      const message = this.nextMessages.shift()

      if (!message) {
        return
      }

      this.currentMessages.push(message)
      this.playCurrent()
    },

    async playCurrent() {
      const message = this.currentMessages[this.currentMessages.length - 1]
      let playAnimer = this.playAnimerMap[message?.id]

      if (!message || playAnimer) {
        return
      }

      playAnimer = this.playAnimerMap[message.id]= anime.timeline()

      playAnimer
        .add({
          duraton: 1000,
          complete: () => {
            message.status = 'sent'
            this.$emit('onMessageSent', { messages: this.currentMessages })
          }
        })

      if (this.needAnimate) {
        playAnimer
          .add({
            duration: message.switchDelay
          })

        await playAnimer.finished

        if (message.duration !== -1) {
          playAnimer.add({
            duraton: message.duration,
            complete: () => {
              message.status = 'played'
            }
          })
        }

        if (message.autoSwitch) {
          this.switchNext()
        }
      }
    },

    addMessage(message, options) {
      if (typeof message === 'string') {
        message = {
          message,
          ...options
        }
      }

      message = this.formatMessageData(message)

      if (this.needAnimate) {
        this.nextMessages.push(message)
        this.switchNext()
      } else {
        this.currentMessages.push(message)
        this.playCurrent()
      }
    },

    clearAll() {
      this.nextMessages = []
      this.currentMessages = this.currentMessages.map(message => {
        message.status = 'played'
        return message
      })
    },

    genId () {
      return `${+new Date}${Math.floor((1 + Math.random()) * 0x10000).toString(16)}`
    },

    getRoleByName(name) {
      if (!name) {
        return this.defauleRole
      }

      return this.roles.find(role => role.name === name) || {}
    },

    formatMessageData(message) {
      const name = typeof message.user === 'string' ? message.user : message.user?.name
      const role = this.getRoleByName(name)

      if (message.id && message.createdDate) {
        return message
      }

      return {
        autoSwitch: true,
        duration: 10000,
        switchDelay: 3300,
        id: this.genId(),
        createdDate: Date.now(),
        needAnimate: this.needAnimate,
        isMe: role.isMe,
        isSystem: role.isSystem,
        status: role.isMe ? 'sent' : 'typing',
        ...this.messageOptions,
        ...message,
        user: {
          name: role.name,
          avatar: role.avatar,
          ...message.user
        }
      }
    }
  }

}
</script>

<style lang="stylus">
.ink-story
  $scrollMaskSize = 10%
  width: 100%
  padding: 8px 0

  .collapse-transition-wapper
    width: 100%

  @keyframes fadeIn {
    to {
      opacity: 1
    }
  }

  @keyframes fadeOut {
    to {
      opacity: 0
    }
  }

  .ink-message-bubble
    opacity: 0
    animation: fadeIn 500ms forwards

    &.status-played
      transition: 500ms
      animation: fadeOut 500ms forwards
      transform: translateY(-50%)
      pointer-events: none

  .scrollable-y
    padding: 50px 0
    padding-right: 10px
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 1) $scrollMaskSize,
      rgba(0, 0, 0, 1) 80%,
      rgba(0, 0, 0, 0.5) (100% - $scrollMaskSize),
      rgba(0, 0, 0, 0) 100%
    )
    mask-size: 100% 100%

  .list-enter-active,
  .list-leave-active
    transition: all 500ms

  .list-enter,
  .list-leave-to
    opacity: 0
</style>
