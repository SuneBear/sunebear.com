<template lang="pug">
.split-text(
  :class="[ `effect-${effect}` ]"
)
  span.char(
    v-for="(char, index) in text"
    :class="{ 'is-typed': textTypingIndex >= index, 'is-current': index === textTypingIndex }"
  )
    mixin charSpan
      | {{ char }}
      span.block( v-if="char == ' '" )

    template( v-if="effect === 'normal'" )
      +charSpan

    template( v-else="effect === 'chunk'" )
      .char-chunk.chunk-mask
        .scaled-text {{ char }}
      .char-chunk.chunk-text {{ char }}
      .char-chunk.chunk-placeholder
        +charSpan
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },

    effect: {
      type: String,
      // @values: normal | 'chunk'
      default: 'chunk'
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
      null

  &.effect-normal
    .char
      &.is-current
        // display: inline-block
        position relative

        &:before
          content: ''
          position absolute
          top: 0
          left: 0
          z-index: -1
          background: var(--cursor-background)
          width: 100%
          height: 100%
          border-radius: 2px
          cursor()

  &.effect-chunk
    $scale = 5
    // @TODO: Polish chunk effect
    .char
      position relative
      display inline-block
      overflow hidden

    .chunk-mask
      display: inline-block
      position: absolute
      overflow: hidden
      z-index: 3
      top: 0
      left: 0
      bottom: 0
      transition: transform 0.7s
      transition-timing-function: cubic-bezier(.165,.84,.44,1)

      .scaled-text
        opacity: 0.3
        transform: scaleX($scale) translate3d(0px, 0px, 0px)
        transform-origin: left top
        // transition-delay: 0.45s
        // transition-duration: 1100ms
        // transition: left 1.1s, top 1.1s
        // transition-timing-function: cubic-bezier(.165,.84,.44,1)
        text-shadow: none

    .chunk-placeholder
      visibility: hidden

    .chunk-text
      position: absolute
      top: 0
      left: 0
      overflow: hidden
      opacity: 0
      transition: 300ms

    .char.is-typed
      $transPct = 105%

      .chunk-mask
        transform: translate3d($transPct, 0, 0px)

        .scaled-text
          transform: scaleX($scale) translate3d(-($transPct / $scale), 0px, 0px)

      .chunk-text
        opacity: 1

</style>
