<template lang="pug">
.cear-photo-frame(
  :class="rootClass"
)
  // @FIXME: Improve Safari perf
  svg.svg-defs-wrapper
    defs
      filter(
        :id="filterId"
        width="100"
        height="100"
      )
        feTurbulence(
          ref="feTurbulence"
          :seed="randomSeed"
          numOctaves="10"
          :baseFrequency="distortedBaseFrequency"
          type="turbulence"
        )
        feColorMatrix(
          ref="hueRotate"
          type="hueRotate"
          values="0"
        )
        feColorMatrix(
          type="matrix"
          values=`1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 20 0`
        )
        feDisplacementMap(
          in="SourceGraphic"
          xChannelSelector="R"
          yChannelSelector="R"
          scale="8"
          result="displacementResult"
        )

  .mask-wrapper(
    :class="transitionClass"
    :style="borderStyle"
  )
    .mask-distort-border(
      v-if="isEnableDistortedBorder"
    )
      .distort-inner-border(
        :style="applyFilterStyle"
      )
    .mask-overlay
    .inner-content
      slot
</template>

<script>
import { random } from '~/utils/random'
import anime from 'animejs'

// @TODO: Add some frame styles
export default {

  props: {
    strokeWidth: {
      type: String,
      default: '12px'
    },

    isShowStaticFrame: {
      type: Boolean
    },

    isEnableDistortedBorder: {
      type: Boolean,
      default: true
    },

    distortedFrequencyAmount: {
      type: Number,
      default: 1
    },

    distortedBorderSpeed: {
      type: Number,
      default: 1
    }
  },

  computed: {
    rootClass() {
      return {
        'is-show-static-frame': this.isShowStaticFrame,
      }
    },

    transitionClass() {
      return {
        'enter-transition': false,
        'scene-transition': false
      }
    },

    borderStyle () {
      return {
        '--border-width': this.strokeWidth,
        '--distort-border-width': '5px'
      }
    },

    filterId() {
      return `filter-photo-frame-${this.cachedUid}`
    },

    applyFilterStyle() {
      return {
        filter: `url(#${this.filterId})`
      }
    },

    distortedBaseFrequency() {
      return this.distortedFrequencyAmount * 0.005
    },

    distortedBorderSeconds() {
      return 10 / this.distortedBorderSpeed * (1440 / this.$el.clientWidth)
    },

    randomSeed() {
      return random.rangeFloor(0, 100)
    }
  },

  data() {
    return {
      cachedUid: null
    }
  },

  created() {
    this.cachedUid = this._uid || 0
  },

  mounted() {
    if (this.isEnableDistortedBorder) {
      this.startDistortAnimate()
    }
  },

  activated() {
    if (this.isEnableDistortedBorder) {
      this.startDistortAnimate()
    }
  },

  deactivated() {
    this.stopDistortAnimate()
  },

  methods: {
    startDistortAnimate() {
      if (this.distortAnimer) {
        return
      }

      const generateAnimer = () => {
        this.distortAnimer = anime({
          targets: this.$refs.hueRotate,
          values: '+=360',
          easing: 'linear',
          duration: this.distortedBorderSeconds * 1000,
          complete: () => {
            generateAnimer()
          }
        })
      }

      // @FIXME: feColorMatrix animate perf is bad
      // Try to impl a webgl version
      // generateAnimer()
    },

    stopDistortAnimate() {
      if (this.distortAnimer) {
        this.distortAnimer.pause()
        this.distortAnimer = null
      }
    }
  },

}
</script>

<style lang="stylus">
.cear-photo-frame
  max-width: 100%

  @keyframes cear-mask-enter
    0%
      mask-position: 4000% 0%

    99%
      mask-position: 100% top

    100%
      mask-position: 100% top

  &.is-show-static-frame
    mask-image: url(@/assets/cear-ui/static-frame-mask.png)
    mask-size: 100% 100%

  .mask-wrapper
    position: relative
    width: 100%
    height: 100%
    border: 2px solid $secondary
    border-width: s('min(var(--border-width), 4vw)')
    border-radius: 10px / 15px

  .mask-wrapper
    &.enter-transition
      mask-size: 4000% 100%
      mask-image: url(@/assets/cear-ui/ink-transition-sprite-mask.png)
      animation: cear-mask-enter 2s steps(39) 0.5s both
      mask-position: 4000% top

    &.scene-transition
      .mask-distort-border
        border-width: 20px

      .mask-overlay
        opacity: 0.3

    &.page-transition
      // @TODO

  .mask-distort-border,
  .mask-overlay
    pointer-events: none
    position: absolute
    z-index: $zIndexPhotoFrame
    inset: -1px
    transition: 800ms

  .mask-overlay
    opacity: 0
    background-color: $secondary

  .mask-distort-border,
  .distort-inner-border
    border: var(--distort-border-width) solid $secondary

  .distort-inner-border
    width: s('calc(1.7 * var(--distort-border-width) + 100%)')
    height: s('calc(1.7 * var(--distort-border-width) + 100%)')
    margin: s('calc(-1 * var(--distort-border-width))') !important

  .inner-content
    position: relative
    overflow: hidden

    > *
      max-width: 100%
      vertical-align: middle
</style>
