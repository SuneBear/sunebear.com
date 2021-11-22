<template lang="pug">
.limit-layout.default-layout(
  v-resize:throttle.initial="handleResize"
)
  cear-photo-frame.global-frame(
    :distortedBorderSpeed="3"
    :distortedFrequencyAmount="0.6"
    :isShowStaticFrame="isShowStaticFrame"
  )
    transition( :duration="pageTransitionDuration" )
      nuxt(
        ref="pageWrapper"
        keep-alive
      )
  cear-svg-filters
  cear-mask.distort-filter-def( :id="0" :enableDistort="false" :enableSpot="false" :enableGrain="false" )
</template>

<script>
import { debugCreator } from '@/utils/dev'
import { math } from '@/utils/math'
const layoutDebug = debugCreator('Layout')

export default {
  data() {
    return {
      pageTransitionDuration: 1000,
      isShowStaticFrame: false,
      zoom: 1
    }
  },

  head() {
    return {
      bodyAttrs: {
        // style: `zoom: ${this.zoom}`
      }
    }
  },

  computed: {
    pageName() {
      return this.$route.name
    }
  },

  methods: {
    handleResize() {
      this.zoom = math.clamp(window.innerWidth / 1440, 1, 1.5)
    }
  }

}
</script>

<style lang="stylus">
@media $mediaInLargeScreen
  body
    // @FIXME: Compatibility with canvas
    // zoom: 1.3

.default-layout
  // @HACK: keep fullscreen with zoom
  position fixed
  width: 100vw
  max-width: 100%
  height: 100vh
  max-height: 100%

  .container
    max-width: 780px

  .global-frame
    .mask-wrapper
      background-color: brand(5)

      @media $mediaInMobile
        border: none

    &,
    .inner-content,
    .page-wrapper
      width: 100%
      height: 100%

  .distort-filter-def
    height: 0

.page
  padding: 160px 12px
  min-height: 100%
  padding-bottom: var(--footer-height)

  \.global-frame.is-show-static-frame &
    padding: 60px 20px 100px

// Tweakpane
.tp-dfwv
  left: 8px
  z-index: 23333
</style>
