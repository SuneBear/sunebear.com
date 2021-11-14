<template lang="pug">
.ink-story(
  :class="{ 'need-animate': this.needAnimate }"
)
  .story-viewport(
    ref="viewport"
    :class="[{ 'scrollable-y': scrollHeight}, this.needAnimate ? 'hide-scrollbar' : 'brand-scrollbar' ]"
    :style="{ height: scrollHeight }"
  )
    .list-placeholder(
      v-if="needAnimate"
      name="list"
    )
    .d-flex.flex-column(
      tag="div"
    )
      .bubble-wrapper(
        v-for="(message, index) in limitCurrentMessages"
        :class="{ 'status-played': playedMap[message.id] }"
        :key="message.id"
        :id="`message${message.id}`"
      )
        ink-message-bubble(
          v-bind="message"
        )
  .story-action-bar.d-flex.justify-center(
    v-if="enableActionBar"
  )
    template(
      v-if="needAnimate"
    )
      transition( name="el-fade-in" :duration="1000")
        ink-button.mr-4( v-if="currentMessageRaw && !currentMessageRaw.autoSwitch" size="small" @click="switchNext(true)") Next
        ink-button.mr-4( v-else-if="!hasFinished" size="small" @click="clearPlayQueue") Skip
    ink-button.ml-4( v-else="needAnimate" size="small" @click="clearAll" ) Clear
</template>

<script>
import anime from 'animejs'
import { math } from '~/utils/math'

const MIN_DELAY = 0
const FADE_DURATION = 500

// @TODO: Optimize list animation
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

    enableActionBar: {
      type: Boolean
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
      playedMap: {},
      historyMessages: [],
      nextMessages: [],
      currentMessages: []
    }
  },

  computed: {
    currentMessageRaw() {
      return this.currentMessages[this.currentMessages.length - 1]
    },

    limitCurrentMessages() {
      if (this.maxLength) {
        return this.currentMessages.slice(Math.max(this.currentMessages.length - this.maxLength, 0))
      }

      return this.currentMessages
    },

    hasFinished() {
      if (!this.needAnimate) {
        return true
      }

      return !this.nextMessages.length && Object.values(this.playedMap).every(value => value)
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
    },

    hasFinished() {
      if (this.needAnimate && this.hasFinished) {
        console.log('Story animte finished')
        this.clearCurrentMessagesTimer = clearTimeout(() => {
          this.clearCurrentMessagesTimer = null
          this.currentMessages = []
        }, 1000)
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
        this.add(this.initialMessages.map(this.formatMessageData))
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
        duration: this.needAnimate ? math.clamp(scrollTop * 4, 2000, 4000) : 200,
        easing: 'linear',
        complete: () => {
          this.scrollAnimer = null
        }
      })
    },

    switchNext(force) {
      if (this.currentMessageRaw) {
        if (!force) {
          const animer = this.playAnimerMap[this.currentMessageRaw.id]
          if (animer || !this.currentMessageRaw.autoSwitch) return
        } else {
          if (!this.currentMessageRaw.autoSwitch) {
            this.$set(this.playedMap, this.currentMessageRaw.id, true)
          }
        }
      }

      const message = this.nextMessages.shift()

      if (!message) {
        return
      }

      this.historyMessages.push(message)
      this.currentMessages.push(message)
      this.playCurrent()
    },

    async playCurrent() {
      const message = this.currentMessages[this.currentMessages.length - 1]
      let playAnimer = this.playAnimerMap[message?.id]

      if (this.clearCurrentMessagesTimer) {
        clearTimeout(this.clearCurrentMessagesTimer)
      }

      if (!message || playAnimer) {
        return
      }

      playAnimer = this.playAnimerMap[message.id]= anime.timeline()

      playAnimer
        .add({
          duraton: 1000,
          delay: FADE_DURATION,
          complete: () => {
            message.status = 'sent'
            this.$emit('messageSent', { message, messages: this.historyMessages })
          }
        })

      if (this.needAnimate) {
        playAnimer
          .add({
            duration: message.switchDelay || MIN_DELAY
          })

        await playAnimer.finished
        this.playAnimerMap[message.id] = null

        if (message.duration !== -1) {
          anime({
            duraton: message.duration,
            complete: () => {
              // @Hack: Avoid transition flash bug when list change
              this.$set(this.playedMap, message.id, true)
              this.$forceUpdate()
            }
          })
        }

        if (message.autoSwitch) {
          this.switchNext(true)
        }
      }
    },

    add(messages, options) {
      if (!Array.isArray(messages)) {
        messages = [ messages ]
      }

      messages.map((message, i) => {
        setTimeout(() => {
          this.addMessage(message, options)
        }, i * 100)
      })
    },

    addMessage(message, { force = false, unshift = false } = {}) {
      if (typeof message === 'string') {
        message = {
          message,
          ...options
        }
      }

      message = this.formatMessageData(message)

      if (this.needAnimate) {
        this.$set(this.playedMap, message.id, false)
        // @FIXME: keep messages order when unshift
        this.nextMessages[ unshift ? 'unshift' : 'push'](message)
        this.switchNext(force)
      } else {
        this.historyMessages.push(message)
        this.currentMessages.push(message)
        this.playCurrent()
      }
    },

    clearPlayQueue() {
      this.nextMessages = []
      this.currentMessages = this.currentMessages.map(message => {
        this.$set(this.playedMap, message.id, true)
        return message
      })
      this.$forceUpdate()
    },

    clearAll() {
      this.clearPlayQueue()
      this.currentMessages = []
      this.historyMessages = []
      this.$emit('messageClearAll', { message: this.historyMessages })
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

      function getDuration() {
        let duration = 10000
        if (typeof message.autoSwitch !== 'undefined' && !message.autoSwitch) {
          duration = -1
        }
        return duration
      }

      function getSwitchDelay () {
        let delay = message.switchDelay
        if (!message.switchDelay) {
          delay = role.isMe ? MIN_DELAY : 2300
        }
        return Math.max(MIN_DELAY,  delay)
      }

      return {
        autoSwitch: true,
        duration: getDuration(),
        switchDelay: getSwitchDelay(),
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
  position: relative

  &.need-animate
    .story-viewport
      pointer-events: none

  .collapse-transition-wapper
    width: 100%

  @keyframes fadeIn
    from
      opacity: 0
    to
      opacity: 1

  @keyframes fadeOut
    from
      opacity: 1
    to
      opacity: 0

  .list-placeholder
    height: 100%

  .bubble-wrapper
    transform: translateY(0)
    animation: fadeIn 500ms

    & + .bubble-wrapper
      margin-top: 20px

    &.status-played
    .ink-message-bubble.status-played
      transition: 500ms
      transform: translateY(-50%)
      animation: fadeOut 500ms forwards
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

  .story-action-bar
    position: absolute
    right: 0
</style>
