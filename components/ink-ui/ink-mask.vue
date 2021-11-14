<template lang="pug">
.ink-mask(
  :style="applyNoiseStyle"
  :class="{ 'enable-grain': enableGrain }"
)
  client-only
    svg.svg-defs-wrapper.noise-background(
      v-if="isNeedGrainNoiseSvg"
      id="grainBackground"
    )
      deps
        filter( id="grain" )
          feTurbulence(
            in="neutral-gray"
            numOctaves="100"
            baseFrequency="5"
            type="fractalNoise"
            stitchTiles='stitch'
            result="NOISE"
          )
          rect(
            width="100px"
            height="100px"
            fill="black"
            filter="url(#grain)"
          )

  client-only
    svg.svg-defs-wrapper.distort-filter
      deps
        filter(
          :id="filterId"
        )
          feTurbulence(
            :seed="randomSeed"
            numOctaves="4"
            :baseFrequency="baseFrequency"
            type="fractalNoise"
            stitchTiles='stitch'
            result="turbulenceResult"
          )
          feColorMatrix(
            type="saturate"
            values="30"
          )
          feColorMatrix(
            type="matrix"
            values=`1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 150 -15`
          )
          feDisplacementMap(
            in="SourceGraphic"
            in2="turbulenceResult"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="5"
            result="displacementResult"
          )

  .spot-layer(
    v-if="enableMask && enableSpot"
    :style="applySpotStyle"
  )
    slot
  slot( v-else )
</template>

<script>
import { random } from '~/utils/random'

export default {

  props: {
    enableMask: {
      type: Boolean,
      default: true
    },
    enableSpot: {
      type: Boolean,
      default: true
    },
    enableGrain: {
      type: Boolean,
      default: true
    },
    // @TODO: Optimize long element distort
    isBlock: {
      type: Boolean
    },
    baseFrequency: {
      type: [ Number, String ],
      default: 0.07
    }
  },

  data() {
    return {
      cachedUid: null,
      isNeedGrainNoiseSvg: false
    }
  },

  created() {
    this.cachedUid = this._uid
  },

  computed: {
    filterId() {
      return `filter${this.cachedUid}`
    },
    applyNoiseStyle() {
      if (!this.enableMask) {
        return null
      }

      return {
        filter: `url(#${this.filterId})`,
        transform: `rotateX(${this.rotateDeg}deg) rotateY(${this.rotateDeg}deg) skewX(${random.sign() * this.skewDeg}deg) translateZ(-1px)`
      }
    },
    applySpotStyle() {
      if (!this.enableMask || !this.enableSpot) {
        return null
      }

      const maskSize = random.range(20, 140)

      return {
        'mask-size': `${maskSize}%`,
        'mask-position': `${maskSize - 100 / 2}% center`
      }
    },
    rotateDeg() {
      if (this.isBlock) {
        return random.range(-0.1, 0.1)
      }
      return random.range(-1, 1)
    },
    skewDeg() {
      return random.range(-2, 2)
    },
    randomSeed() {
      return random.rangeFloor(0, 100)
    }
  }

}
</script>

<style lang="stylus">
// @FIXME: Resolve Safari compatibility
.ink-mask
  height 100%

  // @TODO: Replace mask image with inline svg grainBackground
  &.enable-grain
    // mask-image: s('url(inline.svg#grainBackground)')
    mask-image: url(@/assets/ink-ui/mask-grain-noise.png)
    // mask-image: url(@/assets/ink-ui/mask-grain-noise.svg)
    mask-repeat: repeat
    mask-type: luminance
    // @FIXME: Chrome not support mask-mode: luminance
    mask-mode: luminance

  // @TODO: Generate mask image via procedure
  .spot-layer
    height 100%
    display flex
    mask-size: 1000px
    mask-repeat: repeat
    mask-image: url(@/assets/ink-ui/ink-spot-mask.png)

</style>
