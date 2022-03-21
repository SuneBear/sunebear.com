<template lang="pug">
.d-flex.cear-message-bubble(
  :class="rootClass"
)
  .bubble-user(
    v-if="!isMe && user.avatar"
  )
    .cover.avatar(
      :style="{ backgroundImage: `url(${user.avatar})` }"
    )
  .bubble-body-wrapper
    .bubble-body
      .bubble-bg-wrapper
        cear-mask(
        )
          .bubble-bg
      .bubble-content
        .typing-indicator.d-flex.align-center(
          v-if="status === 'typing'"
        )
          .typing-dot
          .typing-dot
          .typing-dot
        //- @FIXME: duration param is invalid, support dynamic duration based on message height
        //- transition( name="cear-fade" )
        //- @TODO: Improve expand performance
        el-collapse-transition
          .content-wrapper(
            v-show="status !== 'typing'"
            :style="{ transitionDuration: `${isShowActionBar ? 1000 : 800}ms` }"
            :class="{ 'is-show':  status !== 'typing'}"
          )
            readable-render(
              :content="finalMessage"
              :contentData="{ needAnimate }"
            )

            .action-bar.mt-3.d-flex.flex-column(
              v-if="isShowActionBar"
            )
              .action-item(
                v-for="action in actions"
              )
                cear-button(
                  size="small"
                  type="brand"
                  icon="message-3-fill"
                  @click="handleActionClick(action)"
                ) {{ action.text }}
</template>

<script>
export default {

  props: {
    // Display info
    message: {
      type: String
    },

    createdDate: {
      type: [ String, Number ]
    },

    status: {
      type: String,
      // @values: typing | sent | recall
      default: 'sent'
    },

    isMe: {
      type: Boolean
    },

    isSystem: {
      type: Boolean
    },

    user: {
      type: Object,
      default: () => ({
        name: null,
        avatar: null
      })
    },

    // Action Part
    needAction: {
      type: Boolean
    },

    isActionPerformed: {
      type: Boolean,
      default: false
    },

    isPersistantAction: {
      type: Boolean,
      default: false
    },

    // Action schema:
    // - type: reply | other
    // - text: String
    // - responsive: String
    // - perform: Fucntion @TODO
    actions: {
      type: Array,
      default: () => []
    },

    // Play contorl
    needAnimate: {
      type: Boolean
    },

    duration: {
      type: Number,
      default: -1
    },

    switchDelay: {
      type: Number,
      default: 3000
    },

    autoSwitch: {
      type: Boolean,
      default: true
    },

    id: {
      type: String
    }
  },

  computed: {
    finalMessage() {
      return this.processMessage(this.message)
    },

    rootClass() {
      return [
        { 'is-me': this.isMe },
        { 'is-system': this.isSystem },
        `status-${this.status}`
      ]
    },

    isShowActionBar() {
      return [
        // this.status !== 'typing' ,
        !this.isActionPerformed || (this.isActionPerformed && this.isPersistantAction),
        this.actions.length
      ].every(fn => fn)
    }
  },

  methods: {
    handleActionClick(action) {
      this.$emit('actionPerformed', this, action)
      action.perform && action.perform(this)
    },

    processMessage(message) {
      const regexBold = /\*\*(\S(.*?\S)?)\*\*/gm
      const regexItalic = /\*(\S(.*?\S)?)\*/gm

      const notationReplace = '<cear-notation isShow needSpacing :animate="false" :iterations="3">$1</cear-notation>'

      message = message
        .replace(regexBold, notationReplace)
        .replace(regexItalic, notationReplace)

      return message
    }
  }

}
</script>

<style lang="stylus">
$avatarSpacing = 20px
$userWidth = 68px

.cear-message-bubble
  width: 100%

  & + &
    margin-top: 20px

  &.is-system
    justify-content center
    margin-left: $avatarSpacing

    .bubble-body
      // padding: 5px 15px
      // font-size: 14px

    .bubble-bg
      background-color: primary(15)

  &.is-me
    justify-content flex-end
    align-self flex-end

    .bubble-bg
      background-color: brand(75)

  .bubble-user
    flex-shrink: 0
    margin-right: 0px
    width: $userWidth

    .avatar
      width: 48px
      height: 48px
      border-radius: 50%
      border: 2px solid $secondary
      // transform: scale(0.8)
      margin-right: $avatarSpacing
      transform-origin: left top

  .bubble-body-wrapper
    max-width: 70%

  .bubble-body
    position relative
    padding: 10px 20px

  .bubble-bg-wrapper
    position absolute
    inset: 0

    .cear-mask
      height: 100%

  .bubble-bg
    width: 100%
    height: 100%
    background-color: secondary(90)
    border-radius: 10px / 15px

  .bubble-content
    position relative
    z-index 3
    // font-weight: bold

  @keyframes typing-dot-frames
    0%
      transform: scale3d(.8,.8,1) translateY(0)
      opacity: .35

    50%
      transform: scale3d(1,1,1) translateY(-5px)
      opacity: 1

    100%
      transform: scale3d(1,.8,1) translateY(0)
      opacity: .55

  .typing-indicator
    position relative
    margin-top: 3px
    height: 26px

  .typing-dot
    animation: typing-dot-frames .75s cubic-bezier(.445,.05,.55,.95) infinite;
    margin: 0 2px
    width: 5px
    height: 5px
    position: relative
    border-radius: 50%
    background-color: primary(90)

    &:nth-child(2n)
      animation-delay: .2s

    &:nth-child(3n)
      animation-delay: .5s

  .content-wrapper
    position relative
    overflow: hidden
    height: 0px
    min-height: 29px
    // display: none

    &.is-show
      will-change: auto
      height: auto

  .action-item
    pointer-events: initial
</style>
