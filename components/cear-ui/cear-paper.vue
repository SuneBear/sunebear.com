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
      default: 'secondary',
      validator: (val) => {
        return [
          'secondary',
          'brand-dotted',
          'solar-dotted',
          'polka-dotted',
          'polka-dark-dotted',
          'cross-dot',
          'skew-bars',
          'leaf',
          'line',
        ].includes(val)
      },
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
    // background-image: url(@/assets/cear-ui/patterns/lined-paper-2.png)
    background-color: hsl(52deg 27% 95%)
    background-image:
      url(@/assets/cear-ui/patterns/noise.png),
      repeating-linear-gradient(0deg, primary(2), primary(2) 1px, transparent 1px, transparent);
    background-size: auto, 20px 20px

  &.background-polka-dotted,
  &.background-polka-dark-dotted
    --background: rgba(252, 139, 147, 0.3)
    --dot-color: #fc8b93
    --dot-size: 10px
    background-color: var(--background)
    background-image: radial-gradient(circle, var(--dot-color) 20%, transparent 20%), radial-gradient(circle, var(--dot-color) 20%, transparent 20%)
    background-size: var(--dot-size) var(--dot-size), var(--dot-size) var(--dot-size)
    background-position: 0 0, calc(var(--dot-size) / 2) calc(var(--dot-size) / 2)

  &.background-polka-dark-dotted
    --background: #965784
    --dot-color: white

  &.background-cross-dot
    background-color: var(--background, #f5eed7)
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='47.5' height='47.5' viewBox='0 0 100 100'><path d='M 25 10 L 25 17 M 25 33 L 25 40 M 10 25 L 17 25 M 33 25 L 40 25' stroke='%23CD803D' stroke-width='6' stroke-linecap='round' /><circle cx='75' cy='75' r='4' fill='%23CD803D'/></svg>")
    background-size: 20px 20px
    background-position: 5px 10px

  &.background-skew-bars
    --bar-size: 8px
    color: #8fe1e7

    background: repeating-linear-gradient(-45deg, transparent, transparent var(--bar-size), currentColor var(--bar-size), currentColor calc(2 * var(--bar-size)))
    background-size: calc(var(--bar-size) * 2.5) calc(var(--bar-size) * 2.5)
    background-color: var(--background, #ffe67c)

  &.background-leaf
    --pattern-size: 30px
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='60' height='30'%3E%3Cpath fill='%2340584a' fill-opacity='0.47' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 20.2 40H0zM65.32.75A20.02 20.02 0 0 1 40.8 25.26 20.02 20.02 0 0 1 65.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 0 1 .75 5.25 20.08 20.08 0 0 1 .07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 0 0 2 40zm5.38 0h9.8a17.98 17.98 0 0 0 6.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0 0 63.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0 0 17.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'%3E%3C/path%3E%3C/svg%3E")
    background-color: var(--background, #b5ccbf)
    background-size: calc(var(--pattern-size)) calc(var(--pattern-size) / 2)

  &.background-music-note
    // background-color #fdfdf5
    // background-image: url(@/assets/cear-ui/patterns/cocorini-umbrella.png)
    // background-blend-mode: softer-light

</style>
