<template lang="pug">
svg.svg-defs-wrapper.cear-svg-filters
  defs
    //- squiggly
    filter( id="filter-squiggly-0" )
      feTurbulence(
        baseFrequency="0.02"
        numOctaves="3"
        result="noise"
        seed="0"
      )
      feDisplacementMap(
        in="SourceGraphic"
        in2="noise"
        :scale="squigglyBaseScale"
      )
    filter( id="filter-squiggly-1" )
      feTurbulence(
        baseFrequency="0.02"
        numOctaves="3"
        result="noise"
        seed="1"
      )
      feDisplacementMap(
        in="SourceGraphic"
        in2="noise"
        :scale="squigglyNoiseScale"
      )
    filter( id="filter-squiggly-2" )
      feTurbulence(
        baseFrequency="0.02"
        numOctaves="3"
        result="noise"
        seed="2"
      )
      feDisplacementMap(
        in="SourceGraphic"
        in2="noise"
        :scale="squigglyBaseScale"
      )
    filter( id="filter-squiggly-3" )
      feTurbulence(
        baseFrequency="0.02"
        numOctaves="3"
        result="noise"
        seed="3"
      )
      feDisplacementMap(
        in="SourceGraphic"
        in2="noise"
        :scale="squigglyNoiseScale"
      )
    filter( id="filter-squiggly-4" )
      feTurbulence(
        baseFrequency="0.02"
        numOctaves="3"
        result="noise"
        seed="4"
      )
      feDisplacementMap(
        in="SourceGraphic"
        in2="noise"
        :scale="squigglyBaseScale"
      )

    //- Round Corner
    filter( id="filter-round-corner" )
      feGaussianBlur(
        in="SourceGraphic" stdDeviation="8" result="blur"
      )
      feColorMatrix(
        in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"
      )
      feComposite(
        in="SourceGraphic" in2="goo" operator="atop"
      )
</template>

<script>
import { isSafari } from '~/utils/env'

// @TODO: Add gooey effect
export default {

  props: {
    idPrefix: {
      type: String,
      default: ''
    },
    scaleFactor: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      squigglyBaseScale: 1,
      squigglyNoiseScale: 2
    }
  }

}
</script>

<style lang="stylus">
.svg-defs-wrapper
  width: 0
  height: 0
  position absolute
  visibility: hidden

.cear-svg-filters
  null
</style>
