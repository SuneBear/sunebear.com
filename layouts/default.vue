<template lang="pug">
.limit-layout.default-layout(
  v-resize:throttle.initial="handleResize"
)
  cear-photo-frame.global-frame(
    id="global-frame"
    :distortedBorderSpeed="3"
    :distortedFrequencyAmount="0.6"
    :isShowStaticFrame="isShowStaticFrame"
  )
    //- @TODO: Move header to layout, define the transition property on each page to support leave effect
    transition( :duration="pageTransitionDuration" )
      nuxt(
        ref="pageWrapper"
        keep-alive
      )

  //- Global Defs
  cear-svg-filters( v-if="!isSafari" )
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
      titleTemplate: `%s - ${this.$t('sunebaer')}`,
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
  width: 100vw
  max-width: 100%
  height: 100vh
  max-height: 100%

  // @HACK: keep fullscreen with zoom
  @media $mediaInMiddleScrren
    position fixed
    transform: translate3d(0,0,0)

  .container

    &:not(.is-responsive)
      max-width: clamp(375px, 50vw, var(--container-width))

      @media $mediaInMiddleScrren
        padding-left: 2vw

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
      overflow-x: hidden

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
  top: auto !important
  left: 2rem
  bottom: 2rem
  z-index: 23333

// Print scrollable content
@media print
  body, .default-layout, .page-wrapper
    display: block !important
    position: relative !important
    width: auto !important
    height: auto !important
    overflow: visible !important
    margin-left: 0 !important
</style>
