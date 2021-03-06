<template lang="pug">
.cear-story(
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
        cear-message-bubble(
          v-bind="message"
          @actionPerformed="handleMessagePerformed"
        )
  .story-action-bar.d-flex.justify-center(
    v-if="enableActionBar"
  )
    template(
      v-if="needAnimate"
    )
      transition( name="el-fade-in" )
        cear-button.mr-4( v-if="currentMessageRaw && (nextMessages.length)" size="small" @click="switchNext(true)") {{ $t('action.continue') }}
        cear-button.mr-4( v-else-if="currentMessageRaw && currentMessageRaw.autoSwitch && !hasFinished" size="small" @click="clearPlayQueue") {{ $t('action.skip') }}
    cear-button.ml-4( v-else="needAnimate" size="small" @click="clearAll" ) {{ $t('story.clear') }}
</template>

<script>
import anime from 'animejs'
import { math } from '~/utils/math'

const MIN_DELAY = 0
const FADE_DURATION = 500

const COMMON_ROLE_MAP = {
  system: { name: 'system', isSystem: true },
  user: { name: 'user', isMe: true }
}

// @TODO: Optimize list animation
// @TODO: Support divider/date type mesesage
export default {

  props: {
    needAnimate: {
      type: Boolean,
      default: true
    },
    needAction: {
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

    initialMessages() {
      if (!this.needAnimate) {
        this.initData()
      } else {
        this.historyMessages = this.initialMessages
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
          // ...this.currentMessages,
          ...this.initialMessages.map(message => this.formatMessageData({
            ...message,
            status: 'sent'
          }))
        ]
        this.historyMessages = [...this.currentMessages]
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
        duration: this.needAnimate ? math.clamp(scrollTop * 4, 2000, 4000) : 500,
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

      playAnimer = this.playAnimerMap[message.id] = anime.timeline()

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

        // Stuff After switch delay
        this.playAnimerMap[message.id] = null

        if (message.duration !== -1) {
          anime({
            duration: message.duration,
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

    // when set duration: 0, the message will push to history directly
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

    addMessage(message, { force = false, unshift = false, ...options } = {}) {
      if (typeof message === 'string' || typeof message === 'number') {
        message = {
          message,
          ...options
        }
      } else {
        message = {
          ...options,
          ...message
        }
      }

      message = this.formatMessageData(message)

      if (this.needAnimate && !message.silent) {
        this.$set(this.playedMap, message.id, false)
        // @FIXME: keep messages order when unshift
        this.nextMessages[ unshift ? 'unshift' : 'push'](message)
        this.switchNext(force)
      } else {
        this.historyMessages.push(message)
        if (!message.silent) {
          this.currentMessages.push(message)
          this.playCurrent()
        }
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

      if (name)

      return this.roles.find(role => role.name === name) || COMMON_ROLE_MAP[name]
    },

    updateMessage(id, patch) {
      this.historyMessages = this.historyMessages.map(el => {
        if (el.id === id) {
          Object.assign(el, patch)
        }
        return el
      })

      this.currentMessages = this.currentMessages.map(el => {
        if (el.id === id) {
          Object.assign(el, patch)
        }
        return el
      })

      this.$emit('messageUpdated', { messages: this.historyMessages })
    },

    handleMessagePerformed($messageVm, action) {
      this.updateMessage($messageVm.id, {
        isActionPerformed: true
      })

      // Auto reply logic
      if (action.type === 'reply') {
        const nextMessages = [ { user: 'user', message: action.text } ]
        if (action.responsive) {
          nextMessages.push({ message: action.responsive })
        }
        this.add(nextMessages, { force: true })
        return
      }

      this.switchNext(true)
    },

    formatMessageData(message) {
      const name = typeof message.user === 'string' ? message.user : message.user?.name
      const role = this.getRoleByName(name)

      if (message.actions && typeof message.autoSwitch === 'undefined') {
        message.autoSwitch = false
      }

      if (message.id && message.createdDate) {
        return message
      }

      function getDuration() {
        let duration = 8000
        if (typeof message.autoSwitch !== 'undefined' && !message.autoSwitch) {
          duration = -1
        }
        return duration
      }

      const getSwitchDelay = () => {
        let delay = message.switchDelay
        if (!message.switchDelay) {
          delay = role.isMe ? MIN_DELAY : 2700
        }
        return Math.max(MIN_DELAY, delay)
      }

      return {
        autoSwitch: true,
        silent: false,
        duration: getDuration(),
        switchDelay: getSwitchDelay(),
        id: this.genId(),
        createdDate: Date.now(),
        needAnimate: this.needAnimate,
        needAction: this.needAction,
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
.cear-story
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
    .cear-message-bubble.status-played
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
    right: 6px

    .el-fade-in-enter-active
      transition-duration: 500ms
      transition-delay: 900ms

    .el-fade-in-leave-active
      transition-duration: 400ms
      transform: translateY(-30%)
</style>
