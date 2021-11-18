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
      transition( name="el-fade-in" )
        readable-render(
          v-if="status !== 'typing'"
          :content="message"
          :contentData="{ needAnimate }"
        )
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
      return this.message
    },

    rootClass() {
      return [
        { 'is-me': this.isMe },
        { 'is-system': this.isSystem },
        `status-${this.status}`
      ]
    }
  }

}
</script>

<style lang="stylus">
.cear-message-bubble
  width: 100%

  & + &
    margin-top: 20px

  &.is-me
    justify-content flex-end
    align-self flex-end

    .bubble-bg
      background-color: brand(75)

  .bubble-user
    flex-shrink: 0
    margin-right: 0px

    .avatar
      width: 48px
      height: 48px
      border-radius: 50%
      border: 2px solid $secondary
      // transform: scale(0.8)
      margin-right: 20px
      transform-origin: left top

  .bubble-body
    position relative
    padding: 10px 20px
    max-width: 70%

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
    height: 26px
    margin-top: 3px

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
</style>
