<template lang="pug">
.cear-sprite(
  :style="rootStyle"
)
  .sprite-entity(
    :style="spriteEntityStyle"
  )
  //- Currently only for debug
  .frame-name(
    v-if="isShowFrameName"
  ) {{ formattedFrameName }}
</template>

<script>
import tickerMixin from '~/mixins/ticker'
import { random } from '~/utils/random'

export const CEAR_SPRITES = [

  {
    name: 'still-ground-items',
    src: require('../sketches/the-sinking-isle/assets/spritesheets/still-ground-items.png'),
    spritesheet: require('../sketches/the-sinking-isle/assets/spritesheets/still-ground-items.json'),
    collection: 'still-lifes',
    isPlayable: false
  },

  {
    name: 'still-ground-flowers',
    src: require('../sketches/the-sinking-isle/assets/spritesheets/ground-flowers.png'),
    spritesheet: require('../sketches/the-sinking-isle/assets/spritesheets/ground-flowers.json'),
    collection: 'still-lifes',
    isPlayable: false
  },

  {
    name: 'still-water-items',
    src: require('../sketches/the-sinking-isle/assets/spritesheets/still-water-items.png'),
    spritesheet: require('../sketches/the-sinking-isle/assets/spritesheets/still-water-items.json'),
    collection: 'still-lifes',
    isPlayable: false
  },

  {
    name: 'frog-jump',
    src: require('@/assets/spritesheets/frog-jump.png'),
    spritesheet: require('@/assets/spritesheets/frog-jump.json'),
    collection: 'animals',
    fps: 6,
    isPlayable: true
  },

  {
    name: 'butterfly-fly',
    src: require('../sketches/the-sinking-isle/assets/spritesheets/butterfly.png'),
    spritesheet: require('../sketches/the-sinking-isle/assets/spritesheets/butterfly.json'),
    collection: 'animals',
    isPlayable: true
  }

]

const SPEITE_DEFAULT_OPTIONS = {
  fps: 12,
  scale: 0.25,
  src: null,
  type: undefined,
  collection: undefined,
  size: {},
  frames: [],
  canFlipX: true,
  isLoop: true,
  isPlayable: true
}

// @TODO: Support endDelay param, replace repeated frames
// @TODO: Support position trimmted sprite
export default {

  props: {
    name: {
      type: String,
      required: true
    },

    frameIndex: {
      type: Number,
    },

    frameName: {
      type: String,
    },

    width: {
      type: String
    },

    initData: {
      type: Object,
      default: () => ({})
    }
  },

  mixins: [ tickerMixin ],

  data() {
    return {
      ...SPEITE_DEFAULT_OPTIONS,

      // Procedural
      defaultFrameIndex: undefined,
      isFlipX: undefined,
      isShowFrameName: false,

      // Dynamic status
      time: 0,
      // @TODO: Resolve loop=false case
      hasFinished: false,
      isPlaying: false
    }
  },

  computed: {
    framerate() {
      return 1 / this.fps
    },

    currentIndex() {
      if (typeof this.frameIndex !== 'undefined') {
        return this.frameIndex
      } else if (typeof this.frameName !== 'undefined') {
        const index = this.frames.findIndex(frame => frame.filename.startsWith(this.frameName))
        if (index !== -1) {
          return index
        }
      } else if (typeof this.defaultFrameIndex !== 'undefined') {
        return this.defaultFrameIndex
      }

      return Math.floor(this.time / this.framerate % this.frames.length)
    },

    currentFrame() {
      return this.frames[this.currentIndex] || { frame: {} }
    },

    formattedFrameName() {
      return this.currentFrame.filename.replace(/\.[^/.]+$/, '')
    },

    spriteEntityStyle() {
      const { w, h } = this.size
      const { frame } = this.currentFrame

      return {
        backgroundImage: `url(${this.src})`,
        // @REF: https://github.com/alexx855/Responsive-CSS-image-sprites
        backgroundSize: `${w / frame.w * 100}%`,
        backgroundPosition: `${frame.x / (w - frame.w) * 100}% ${frame.y / (h - frame.h) * 100}%`,
        // aspectRatio: `${frame.w} / ${frame.h}`,
        paddingTop: `${frame.h / frame.w * 100}%`,
        transform: `scaleX(${ this.isFlipX ? -1 : 1 })`
      }
    },

    rootStyle() {
      const { frame } = this.currentFrame

      return {
        width: this.width || `${frame.w * this.scale}px`
      }
    }
  },

  watch: {
    isPlaying() {
      this.enableTicker = this.isPlaying
    }
  },

  created() {
    this.init()
  },

  methods: {
    init () {
      let spriteInfo = CEAR_SPRITES.find(el => el.name === this.name)

      if (!spriteInfo) {
        console.warn(`Sprite not found: ${this.name}`)
        return
      }

      // Clone object and delete props
      spriteInfo = { ...spriteInfo }
      delete spriteInfo.name

      // Overide default data
      Object.assign(this, spriteInfo, this.initData)
      this.frames = this.spritesheet.frames
      this.size = this.spritesheet.meta.size

      // Set default style and frame
      if (this.canFlipX && typeof this.isFlipX === 'undefined') {
        this.isFlipX = random.boolean()
      }
      if (!this.isPlayable && (!this.frameName || !this.frameIndex)) {
        this.defaultFrameIndex = random.rangeFloor(0, this.frames.length - 1)
      }

      // Set ticker
      this.isPlaying = this.isPlayable
    },

    play() {
      if (!this.isPlayable) {
        return
      }

      this.isPlaying = true
    },

    pause() {
      this.isPlaying = false
    },

    reset() {
      this.time = 0
    },

    stop() {
      this.pause()
      this.reset()
    },

    onTick() {
      this.time += this.ticker.delta / 1000
    }
  }

}
</script>

<style lang="stylus">
.cear-sprite
  display: inline-block
  vertical-align: middle

  .sprite-entity
    background-repeat: no-repeat
    background-size: 100%
</style>
