<template lang="pug">
.cear-blob(
  :class="rootClass"
  :style="rootStyle"
  @mouseenter="handleMouseEnter"
  @mouseleave="handleMouseLeave"
)
  .blob-limiter
    client-only
      .blob.css-blob.d-flex.align-center.justify-center(
        v-if="type === 'css'"
        :style="[cssBlobStyle, cssBlobAnimation]"
      )
        .blob-content
          slot
      .blob.svg-blob( v-else-if="type === 'svg'" )
        .blob-bg(
          :style="[ svgBlobTransformStyle ]"
        )
          svg.blob-svg( viewBox="0 0 200 200" )
            defs( v-if="backgroundB" )
              linearGradient(
                :id="gradientId"
                x1="0%" y1="50%" x2="100%" y2="50%"
              )
                stop(offset="5%" :stop-color="background")
                stop(offset="95%" :stop-color="backgroundB")
            path.blob-path(
              vector-effect="non-scaling-stroke"
              transform="translate(100 100)"
              :d="path"
              :style="pathStyle"
            )
        .blob-content.d-flex.align-center.justify-center
          slot( :pointAmount="finalPointAmount" :contrast="finalContrast" )
</template>

<script>
import scaleLinear from 'd3-scale/src/linear'
import radialLine from 'd3-shape/src/lineRadial'
import curveBasisClosed from 'd3-shape/src/curve/basisClosed'
import range from 'd3-array/src/range'
import anime from 'animejs'
import randomMixin from '~/mixins/random'

function remain(n) {
  return 100 - n
}

function randomPointAmount(random) {
  return random.rangeFloor(8, 20)
}

function randomContrast(random) {
  return random.range(1, 3).toFixed(2)
}

// @REF: https://www.blobmaker.app
function roundPath(path, precision = 0.1) {
  if (!path) return
  const query = /[\d.-][\d.e-]*/g
  path = path.replace(
    query,
    n => Math.round(n * (1 / precision)) / (1 / precision)
  )
  return `${path}Z`
}

export default {
  props: {
    width: {
      type: String,
      default: '140px'
    },
    type: {
      type: String,
      // @values: css | svg
      default: 'css'
    },
    isSticker: {
      type: Boolean,
      default: true
    },
    background: {
      type: String,
      default: '#eee'
    },
    backgroundB: {
      type: String,
      default: '#ddd'
    },
    color: {
      type: String,
      default: 'var(--primary)'
    },

    // Aniamtion
    needAnimate: {
      type: Boolean,
      default: false
    },
    needHoverAnimate: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number
    },
    delay: {
      type: Number,
      default: 0
    },
    needSuspend: {
      type: Boolean,
      default: true
    },
    suspendDuration: {
      type: Number
    },

    // Svg only
    // number of points
    pointAmount: {
      type: Number,
      // @values: [ 3, 12 ]
      default: 0
    },

    // difference between points
    contrast: {
      type: Number,
      // @values: [ 1, 8 ]
      default: 0
    }
  },

  mixins: [randomMixin],

  data() {
    return {
      // Common
      cachedUid: null,
      seedPointAmount: null,
      seedContrast: null,
      rotation: 0,

      // CSS
      cssBorderRadius: null,

      // SVG
      path:
        'M49,-44.8C61.7,-36.3,69,-18.1,71.4,2.4C73.7,22.8,71.1,45.7,58.4,58.1C45.7,70.5,22.8,72.4,4.9,67.5C-13.1,62.7,-26.2,51,-40.4,38.6C-54.6,26.2,-69.9,13.1,-72.7,-2.9C-75.6,-18.8,-66.1,-37.7,-51.9,-46.2C-37.7,-54.8,-18.8,-53,-0.4,-52.7C18.1,-52.3,36.3,-53.3,49,-44.8Z',
      nextPath: null,
      pathDuration: 0
    }
  },

  computed: {
    rootClass() {
      return {
        'is-sticker' : this.isSticker,
        'need-animate': this.needAnimate,
        'need-hover-animate': this.needHoverAnimate,
        'need-suspend': this.needSuspend
      }
    },

    rootStyle() {
      return {
        width: this.width,
        color: this.color
      }
    },

    svgBlobTransformStyle() {
      return {
        transform: `rotate(${this.rotation}deg)`
      }
    },

    cssBackground() {
      if (!this.backgroundB) {
        return this.background
      }

      return `linear-gradient(to bottom, ${this.background}, ${this.backgroundB}`
    },

    cssBlobAnimation() {
      if (!this.needAnimate && !this.needHoverAnimate) {
        return
      }

      const startDuration = this.needAnimate ? 20 : 10

      return {
        '--duration': `${this.duration ||
          this.random.range(startDuration, startDuration + 10)}s`,
        '--delay': `${this.delay || this.random.range(0, 2)}s`,
        '--medium-radius': this.generateOrganicBorderRadius()
      }
    },

    cssBlobStyle() {
      return {
        '--rotation': `${this.rotation}deg`,
        '--radius': `${this.cssBorderRadius}`,
        '--suspend-duration': `${this.suspendDuration || this.random.range(5, 15)}s`,
        transform: `rotate(${this.rotation}deg)`,
        background: this.cssBackground,
        borderRadius: this.cssBorderRadius
      }
    },

    gradientId() {
      return `wave-gradient-${this.cachedUid}`
    },

    pathStyle() {
      const style = {
        fill: this.backgroundB ? `url(#${this.gradientId})` : this.background,
        // '--path': `path('${this.path}')`
      }

      if (this.needAnimate) {
        style['--duration'] = `${this.pathDuration}s`
        // style['--nextPath'] = `path('${this.nextPath}')`
      }

      return style
    },

    finalPointAmount() {
      return this.pointAmount || this.seedPointAmount
    },

    finalContrast() {
      return this.contrast || this.seedContrast
    }
  },

  watch: {
    seed() {
      if (this.blobPathAnimer) {
        this.blobPathAnimer.pause()
      }
      this.initBlob(true)
    }
  },

  created() {
    this.cachedUid = this._uid

    this.initBlob()
  },

  mounted() {
    if ((this.needAnimate || this.needHoverAnimate) && this.type === 'svg') {
      this.pathDuration = this.duration || this.random.range(5, 8)
      this.animateSvgBlob()
    }
  },

  deactivated() {
    if (this.blobPathAnimer) {
      this.blobPathAnimer.pause()
    }
  },

  methods: {
    initBlob(force) {
      this.seedPointAmount = randomPointAmount(this.random)
      this.seedContrast = randomContrast(this.random)
      this.generateBlob(force)
    },

    animateSvgBlob() {
      const createAnimer = () => {
        this.blobPathAnimer = anime({
          targets: this,
          path: this.generateOrganicBlobPath(),
          duration: this.pathDuration * 1000,
          delay: this.delay * 1000,
          easing: "easeInOutQuad",
          complete: () => {
            createAnimer()
          }
        })
      }

      createAnimer()

      if (this.needHoverAnimate) {
        this.blobPathAnimer.pause()
      }
    },

    generateBlob(force) {
      this.generateRandomRotation()

      if (!force && this.generated) {
        return
      }

      if (this.type === 'css') {
        this.generateCssBlob()
      } else {
        this.generateSvgBlob()
      }

      this.generated = true
    },

    generateRandomRotation() {
      this.rotation = this.random.range(-180, 180)
    },

    generateCssBlob() {
      this.cssBorderRadius = this.generateOrganicBorderRadius()
    },

    generateOrganicBorderRadius() {
      const r1 = this.random.range(25, 75)
      const r2 = this.random.range(25, 75)
      const r3 = this.random.range(25, 75)
      const r4 = this.random.range(25, 75)
      const r11 = remain(r1)
      const r22 = remain(r2)
      const r33 = remain(r3)
      const r44 = remain(r4)
      return `${r1}% ${r11}% ${r22}% ${r2}% / ${r3}% ${r4}% ${r44}% ${r33}%`
    },

    generateSvgBlob() {
      this.path = this.generateOrganicBlobPath()
    },

    generateOrganicBlobPath() {
      const { finalPointAmount, finalContrast, generateOrganicBlobData } = this
      const data = generateOrganicBlobData(finalPointAmount, finalContrast)

      const shapeGenerator = radialLine()
        .angle((d, i) => (i / data.length) * 2 * Math.PI)
        .curve(curveBasisClosed)
        .radius(d => d)

      return roundPath(shapeGenerator(data.map(d => Math.abs(d))))
    },

    generateOrganicBlobData(pointAmount, contrast) {
      const scale = scaleLinear()
        .domain([0, 1])
        .range([100 - ((100 / 8) * contrast - 0.01), 100])

      return range(pointAmount).map(() => scale(this.random.value()))
    },

    handleMouseEnter() {
      if (this.blobPathAnimer) {
        this.blobPathAnimer.play()
      }
    },

    handleMouseLeave() {
      if (this.blobPathAnimer && this.needHoverAnimate) {
        this.blobPathAnimer.pause()
      }
    }
  }
}
</script>

<style lang="stylus">
.cear-blob
  .blob-limiter
    position relative
    height: 0
    width: 100%
    padding-top: 100%

    > *
      position absolute
      inset 0

  .blob
    overflow: hidden
    // transition: border-radius 1s

  .css-blob
    .blob-content
      transform: rotate(calc(var(--rotation)*-1))
      // @Hack: stretch container
      margin: -5%

  .svg-blob
    .blob-bg
      .blob-svg
        width: 100%
        height: 100%

    .blob-path
      // d: var(--path)

    .blob-content
      position absolute
      z-index 2
      inset: 0
      padding: 20%

  &.is-sticker
    .css-blob
      border: 4px solid $secondary

    .blob-path
      stroke-width: 4px
      stroke: $secondary

  @keyframes css-blob-anim
    0%,
    100% { border-radius: var(--radius) }
    14% { border-radius: 40% 60% 54% 46% / 49% 60% 40% 51% }
    28% { border-radius: 54% 46% 38% 62% / 49% 70% 30% 51% }
    42% { border-radius: var(--medium-radius, 61% 39% 55% 45% / 61% 38% 62% 39%) }
    56% { border-radius: 61% 39% 67% 33% / 70% 50% 50% 30% }
    70% { border-radius: 50% 50% 34% 66% / 56% 68% 32% 44% }
    84% { border-radius: 46% 54% 50% 50% / 35% 61% 39% 65% }

  @keyframes blob-path-anim
    from
      d: var(--path)

    100%
      d: var(--nextPath)

  // @TODO: Optimize suspend animation
  @keyframes suspend-anim
    50%
      transform: translateY(5%)

  &.need-suspend
    animation: suspend-anim var(--suspend-duration, 10s) ease-in-out infinite

  &.need-animate,
  &.need-hover-animate
    .css-blob
      animation css-blob-anim var(--duration, 25s) ease-in-out infinite both var(--delay, 0s)

    .blob-path
      // animation: blob-path-anim var(--duration, 5s) ease-in-out infinite both

  &.need-hover-animate
    .css-blob,
    .blob-path
      animation-play-state: paused
      animation-delay: 0s

    &:hover
      .css-blob,
      .blob-path
        animation-play-state: running
</style>
