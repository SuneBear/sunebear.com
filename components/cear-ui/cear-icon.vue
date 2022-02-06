<template lang="pug">
cear-mask.cear-icon(
  v-bind="maskProps"
  :class="{ 'has-shadow': shadow, 'is-flip-x': isFlipX }"
)
  svg-icon(
    :name="name"
    :fill="fill"
    :stroke="stroke"
    :style="style"
    :class="[ 'svg-symbol', 'symbol-' + name, { 'is-line': isLine } ]"
  )
</template>

<script>
import InkMask from './cear-mask'

export default {
  props: {
    ...InkMask.props,
    maskId: {
      type: [Number, String],
      default: 'icon'
    },
    baseFrequency: {
      type: Number,
      default: 0.02
    },
    'name': String,
    'size': String,
    'isLine': {
      type: Boolean,
      default: false
    },
    'isFlipX': {
      type: Boolean
    },
    // CSS Variables
    'fill': String, 'stroke': String, 'shadow': String, 'circle': String
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
    },

    maskProps() {
      return Object.keys(InkMask.props).reduce((acc, key) => {
        acc[key] = this[key]
        return acc
      }, {})
    }
  }
}
</script>

<style lang="stylus">
.cear-icon
  display: inline-flex
  fill: currentColor
  line-height: 1

  .svg-symbol
    width: 1em
    height: 1em

  &.has-shadow
    .svg-symbol
      filter: drop-shadow(3px 3px 0 var(--shadow))

  &.is-flip-x
    .svg-symbol
      transform: scaleX(-1)

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
