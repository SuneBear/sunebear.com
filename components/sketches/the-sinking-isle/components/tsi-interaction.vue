<template lang="pug">
.tsi-interaction
  .custom-cursor-wrapper(
    :style="customCursorWrapperStyle"
  )
    .move-cursor.d-flex.align-center.justify-center(
      :class="{ 'is-enabled': !isPressOnClickable && $tsi.isPressed && $tsi.enableUserMoveInput }"
    )
      .center-dot
      .move-ripple
</template>

<script>
export default {

  data() {
    return {

    }
  },

  computed: {
    customCursorWrapperStyle () {
      const { x, y } = this.$tsi.cursor

      return {
        transform: `translate3d(-29.1px, -28px, 0) translate3d(${x}px, ${y}px, 0)`
      }
    },

    isPressOnClickable () {
      return false
    }
  }

}
</script>

<style lang="stylus">
.tsi-interaction
  position absolute

  .custom-cursor-wrapper
    position absolute
    transition: 100ms

  .move-cursor
    border: dotted 2px alpha(white, 0.5)
    width: 36px
    height: 36px
    border-radius: 50%
    opacity: 0
    transform: scale(0.5)
    transition: 218ms

    @keyframes moveRipple
      to
        transform scale(1.3)
        opacity 0

    .center-dot
      width: 6px
      height: 6px
      border-radius: 50%
      background: alpha(white, 0.8)

    .move-ripple
      position absolute
      inset: 0
      width: 100%
      height: 100%
      border-radius: 50%
      background: white
      opacity: 0.2
      transform scale(0)

    &.is-enabled
      opacity: 1
      transform: scale(1)

      .move-ripple
        animation moveRipple 3.5s infinite 0.2s
</style>
