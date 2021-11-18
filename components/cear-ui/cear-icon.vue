<template lang="pug">
cear-mask.cear-icon(
  v-bind="$props"
  :class="{ 'has-shadow': shadow }"
)
  svg-icon(
    v-bind="$props"
    :title="name"
    :style="style"
    :class="[ 'svg-symbol', 'symbol-' + name, { 'is-line': isLine } ]"
  )
</template>

<script>
import InkMask from './cear-mask'

export default {
  props: {
    'name': String,
    'size': String,
    'isLine': {
      type: Boolean,
      default: false
    },
    // CSS Variables
    'fill': String, 'stroke': String, 'shadow': String, 'circle': String,
    ...InkMask.props,
    baseFrequency: {
      type: Number,
      default: 0.02
    }
  },

  computed: {
    style() {
      let styleObject = {}
      if (this.size) {
        styleObject['fontSize'] = this.size
      }
      if (this.circle) {
        styleObject['--circle'] = this.circle
      }
      if (this.fill) {
        styleObject['--fill'] = this.fill
      }
      if (this.stroke) {
        styleObject['--stroke'] = this.stroke
      }
      if (this.shadow) {
        styleObject['--shadow'] = this.shadow
      }
      return styleObject
    }
  }
}
</script>

<style lang="stylus">
.cear-icon
  display: inline-flex
  fill: currentColor

  .svg-symbol
    width: 1em
    height: 1em

  &.has-shadow
    .svg-symbol
      filter: drop-shadow(3px 3px 0 var(--shadow))

.svg-symbol
  color: currentColor
  text-align: center
  display: inline-flex
  position: relative

  &.is-line
    --fill: transparent !important
    fill: var(--fill)
    stroke: var(--stroke, var(--primary))
    stroke-width: var(--stroke-width, 1.3px)
    stroke-linecap: round
    stroke-linejoin: round
    stroke-dasharray: 280
    stroke-dashoffset: 0

    &:hover
      animation: draw 3s linear alternate infinite

  @keyframes draw
    0%
      stroke-dashoffset: 280
    100%
      stroke-dashoffset: 0

</style>
