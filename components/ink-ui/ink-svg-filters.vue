<template lang="pug">
svg.svg-defs-wrapper.ink-svg-filters
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
</template>

<script>
import { isSafari } from '~/utils/env'

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
.ink-svg-filters
  null
</style>
