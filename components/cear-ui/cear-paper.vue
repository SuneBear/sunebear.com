<template lang="pug">
.cear-paper(
  :class="rootClass"
)
  slot
</template>

<script>
export default {

  props: {
    name: {
      type: String,
      default: 'secondary'
    }
  },

  computed: {
    rootClass() {
      return [ `background-${this.name}` ]
    }
  }

}
</script>

<style lang="stylus">
.cear-paper
  width: 100%
  min-height: 100%

  &.background-secondary
    background-color $secondary

  &.background-brand-dotted,
  &.background-solar-dotted
    --backgroud: hsl(56deg 60% 96%)

    background-image:
      url(@/assets/cear-ui/patterns/noise.png),
      radial-gradient(brand(30) 1.3px, transparent 1.3px),
      radial-gradient(brand(30) 1.3px, var(--backgroud) 1.3px)
    background-size: auto, 52px 52px, 52px 52px
    background-position: 0 0, 26px 26px
    background-blend-mode: normal, normal // difference

  &.background-brand-dotted
    --backgroud: brandLightness(96)

  &.background-line
    background-image: url(@/assets/cear-ui/patterns/lined-paper-2.png)

</style>
