<template lang="pug">
.split-text
  span.char(
    v-for="(char, index) in text"
    :class="{ 'is-typed': textTypingIndex >= index, 'is-current': index === textTypingIndex }"
  )
    | {{ char }}
    span.block( v-if="char == ' '" )
</template>

<script>
export default {

  props: {
    text: {
      type: String,
      required: true
    },

    progress: {
      type: Number,
      default: -0.01
    },

    typingIndex: {
      type: Number
    }
  },

  computed: {
    textTypingIndex() {
      if (this.typingIndex !== undefined) {
        return this.typingIndex
      }

      if (this.progress < 0) {
        return -1
      }

      return Math.round(this.progress * this.text.length)
    }
  }

}
</script>

<style lang="stylus">
.split-text
  white-space: pre-line
  word-break: break-word
  --cursor-background: $brand

  @keyframes blinking {
    from,
    49.8%{
      opacity: 1
    }
    49.9%,
    99.9% {
      opacity: 0
    }
    to {
      opacity: 1
    }
  }

  cursor()
    animation: blinking 1s linear infinite

  .block
    display: block
    min-width: 0.2em

  .char
    opacity: 0
    position relative

    &.is-typed
      opacity: 1

    &.is-current
      // display: inline-block
      position relative

      &:before
        content: ''
        position absolute
        top: 0
        z-index: -1
        background: var(--cursor-background)
        width: 100%
        height: 100%
        border-radius: 2px
        cursor()
</style>
