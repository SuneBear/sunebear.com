<template lang="pug">
.limit-layout.default-layout
  ink-photo-frame.global-frame(
    :distortedBorderSpeed="3"
    :distortedFrequencyAmount="0.6"
    :isShowStaticFrame="isShowStaticFrame"
  )
    transition( :duration="pageTransitionDuration" )
      nuxt( ref="$page" keep-alive )
</template>

<script>
export default {

  data() {
    return {
      pageTransitionDuration: 1000,
      isShowStaticFrame: false
    }
  }

}
</script>

<style lang="stylus">
.default-layout
  width: 100vw
  height: 100vh

  .global-frame
    &,
    .inner-content
      width: 100%
      height: 100%

    .inner-content
      overflow-y: auto

.page
  padding: 30px 10px
  min-height: 100%

  \.global-frame.is-show-static-frame &
    padding: 60px 20px 100px

// Tweakpane
.tp-dfwv
  left: 8px
  z-index: 23333
</style>
