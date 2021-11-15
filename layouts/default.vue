<template lang="pug">
.limit-layout.default-layout
  ink-photo-frame.global-frame(
    :distortedBorderSpeed="3"
    :distortedFrequencyAmount="0.6"
    :isShowStaticFrame="isShowStaticFrame"
  )
    transition( :duration="pageTransitionDuration" )
      nuxt(
        ref="pageWrapper"
        keep-alive
      )
  ink-svg-filters
  ink-mask.distort-filter-def( :id="0" :enableDistort="false" :enableSpot="false" :enableGrain="false" )
</template>

<script>
import { debugCreator } from '@/utils/dev'
const layoutDebug = debugCreator('Layout')

export default {
  data() {
    return {
      pageTransitionDuration: 1000,
      isShowStaticFrame: false
    }
  },

  computed: {
    pageName() {
      return this.$route.name
    }
  }

}
</script>

<style lang="stylus">
.default-layout
  width: 100vw
  height: 100vh

  .global-frame
    .mask-wrapper
      background-color: primary(5)

    &,
    .inner-content,
    .page-wrapper
      width: 100%
      height: 100%

  .distort-filter-def
    height: 0

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
