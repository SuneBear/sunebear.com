<template lang="pug">
.cear-wave(
  :class="rootClass"
  v-resize:throttle="handleResize"
)
  svg.wave-svg(
    :style="svgStyle"
  )
    client-only
      defs( v-if="colorB" )
        linearGradient(
          :id="gradientId"
          x1="0%" y1="50%" x2="100%" y2="50%"
        )
          stop(offset="5%" :stop-color="color")
          stop(offset="95%" :stop-color="colorB")
    path.wave-path(
      :style="pathStyle"
      :d="path"
    )
</template>

<script>
// import line from 'd3-shape/src/line'
// import area from 'd3-shape/src/area'
// import cardinal from 'd3-shape/src/curve/cardinal'
import tickerMixin from '~/mixins/ticker'
import randomMixin from '~/mixins/random'
import { math } from '~/utils/math'
import { parseUnit } from '~/utils/unit'

const PATH_WIDTH_SCALE = 2
const BASE_VIEWPORT_WIDTH = 800

// @TODO: Support multiple wave layers
// @TODO: Add wave presets, add preset props, need a high order component
export default {
  props: {
    // Style
    lineWidth: {
      type: Number,
      default: 2
    },
    color: {
      type: String,
      default: 'rgba(var(--primary-rgb), 0.4)'
    },
    colorB: {
      type: String,
      default: 'rgba(var(--primary-rgb), 0.8)'
    },
    isRound: {
      type: Boolean
    },

    // Shape
    layerAmount: {
      type: Number,
      default: 1
    },
    amplitudeX: {
      type: [Number, String],
      // @value: number is px, string is percent
      // @range: [1, -100%]
      default: '20%'
    },
    minAmplitudeX: {
      type: Number,
      default: 120
    },
    amplitudeY: {
      type: Number,
      default: 50
    },
    offsetX: {
      type: [Number, String],
      // @values: [0, -100%]
      default: 0
    },
    baseHeight: {
      type: Number,
      default: 30
    },
    randomness: {
      type: Number,
      default: 0.15
    },
    isLine: {
      type: Boolean
    },
    isCurve: {
      type: Boolean,
      default: true
    },
    // @TODO: Convert this param to smoothness
    tension: {
      type: Number,
      // Typically between [0.0, 1.0] but can be exceeded
      default: 0.5
    },
    curveFn: {
      type: Function
    },

    // Animation
    speed: {
      type: Number,
      default: 2
    },
    needAnimate: {
      type: Boolean,
      default: true
    },
    needHoverReveal: {
      type: Boolean,
      default: false
    }
  },

  mixins: [
    tickerMixin,
    randomMixin
  ],

  data() {
    return {
      cachedUid: null,
      path:
        'M0 2 L 8 8 L 16 2 L 24 8 L 32 2 L 40 8 L 48 2 L 56 8 L 64 2 L 72 8 L 80 2 L 88 8 L 96 2 L 104 8 L 112 2 L 120 8 L 128 2',
      svgWidth: process.client && window.innerWidth,
      sineStep: 0
    }
  },

  computed: {
    rootClass() {
      return {
        'is-line': this.isLine,
        'is-round': this.isRound,
        'need-animate': this.needAnimate,
        'need-hover-reveal': this.needHoverReveal
      }
    },

    svgStyle() {
      return {
        height: `${this.height}px`
      }
    },

    gradientId() {
      return `wave-gradient-${this.cachedUid}`
    },

    pathWidth() {
      return this.svgWidth * PATH_WIDTH_SCALE
    },

    pathStyle() {
      const style = {
        fill: this.colorB ? `url(#${this.gradientId})` : this.color
      }

      if (this.isLine) {
        style.strokeWidth = this.lineWidth
        style.stroke = this.colorB ? `url(#${this.gradientId})` : this.color
        style.fill = 'transparent'
      }
      return style
    },

    height() {
      let height = this.amplitudeY + this.lineWidth

      if (!this.isLine) {
        height += this.baseHeight
      }

      return height
    }
  },

  watch: {
    pathWidth() {
      this.generatePath()
    },
    sineStep() {
      this.generatePath()
    }
  },

  created() {
    this.cachedUid = this._uid

    if (!this.needAnimate) {
      this.enableTicker = false
    }
  },

  mounted() {
    this.generatePath()
  },

  methods: {
    genereatePoints() {
      let { offsetX, pathWidth, svgWidth, amplitudeX, minAmplitudeX, amplitudeY, randomness, isLine, lineWidth, height } = this

      let padding = Math.max(amplitudeY * (0.1 + randomness * 0.05), lineWidth * 1.5)
      let isCrazyAnimate = randomness > 1
      const needLimitAmplitudeX = minAmplitudeX && this.needAnimate && !isCrazyAnimate
      const points = []

      if (typeof amplitudeX === 'string') {
        const parsed = parseUnit(amplitudeX)
        if (parsed[1] === '%') {
          amplitudeX = parsed[0] * svgWidth / 100
        }
      }

      if (typeof offsetX === 'string') {
        const parsed = parseUnit(offsetX)
        if (parsed[1] === '%') {
          offsetX = parsed[0] * svgWidth / 100
        }
      }

      if (isLine) {
        amplitudeY = amplitudeY - padding
      }

      if (needLimitAmplitudeX) {
        amplitudeX = Math.max(minAmplitudeX, amplitudeX)
      }

      const bones = Math.ceil(pathWidth / amplitudeX)

      for (var i = 0; i <= bones; i++) {
        let x = (i / bones) * pathWidth + offsetX

        // Build shape & circle move
        const sinOffset = this.needAnimate ? this.sineStep - i : 0
        const sinSeed = i * Math.PI / 2 + sinOffset
        const sinHeight = Math.sin(sinSeed) * amplitudeY
        const noiseHeight = amplitudeY * this.random.noise1D(x) * randomness
        let y = Math.sin(sinSeed) * sinHeight + noiseHeight

        // Translate Y
        // @TODO: Achieve more natural motion
        if (this.needAnimate) {
          // y -= amplitudeY * Math.cos(this.sineStep) * 0.1
        }

        if (isCrazyAnimate) {
          // x += Math.cos(this.sineStep / 10)
        }

        y = math.clamp(y, padding, height - padding)
        points.push([x, y])
      }

      return points
    },

    generatePath() {
      const line = require('d3-shape/src/line').default
      const area = require('d3-shape/src/area').default
      const cardinal = require('d3-shape/src/curve/cardinal').default

      const { isLine, isCurve, tension, curveFn, height } = this
      const draw = isLine ? line() : area().y0(p => Math.abs(height * 2 - p[1]))

      if (isCurve) {
        cardinal.tension(tension)
        draw.curve(curveFn ? curveFn : cardinal)
      }

      this.path = draw(this.genereatePoints())
    },

    onTick() {
      this.sineStep += this.ticker.delta / 1000 * this.speed
    },

    handleResize() {
      const { offsetWidth } = this.$el
      this.svgWidth = offsetWidth
    }
  }
}
</script>

<style lang="stylus">
.cear-wave

  &,
  svg
    display: block
    width: 100%
    height: 100%

  &.is-round
    svg
      border-radius: 10px

  @keyframes wave-path-anim
    0%
      transform: translateX(0)

    100%
      transform: translateX(-20%)

  .wave-path
    // transition: d 0.1s cubic-bezier(0.7, 0, 0.3, 1)
    // animation: wave-path-anim 2s linear infinite

  &.need-hover-reveal
    // @REF: https://css-tricks.com/animating-with-clip-path/
    .wave-path
      clip-path: inset(0 100% 0 0)
      transition: clip-path 1s cubic-bezier(0.7, 0, 0.3, 1)
      stroke-linecap: round

    &:hover
      .wave-path
        clip-path: inset(0)

  &.need-animate
    .wave-path
      // animation: wave-path-anim 2s linear infinite

</style>
