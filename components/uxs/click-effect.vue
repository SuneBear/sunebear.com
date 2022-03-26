<template lang="pug">
.click-effect(
  :style="rootStyle"
)
  .effect-content(
    :class="[ 'type-' + type ]"
    :style="contentStyle"
    ref="content"
  ) {{ finalText }}
</template>

<script>
import gsap from 'gsap'
import { random } from '~/utils/random'

export default {
  props: {
    type: {
      type: String,
      default: 'plus-ones',
      validator: (val) => {
        return [
          'plus-ones',
          'text'
        ].includes(val)
      }
    },

    x: {
      type: Number,
      default: 0
    },

    y: {
      type: Number,
      default: 0
    },

    noise: {
      type: Number,
      default: 0.1
    },

    text: {
      type: [ String, Array ]
    },

    contentStyle: {
      type: Object
    }
  },

  data() {
    return {}
  },

  computed: {
    rootStyle() {
      return {
        left: `${this.finalX}px`,
        top: `${this.y}px`
      }
    },

    finalX() {
      const offset = this.noise * 200
      return this.x + random.range(-offset, offset)
    },

    finalText() {
      if (!this.text) {
        return
      }

      if (Array.isArray(this.text)) {
        return random.pick(this.text)
      }

      return this.text
    }
  },

  mounted() {
    this.playEffect()
  },

  methods: {
    playEffect() {
      if (
        this.type === 'plus-ones' ||
        this.type === 'text'
      ) {
        this.playSwingUpEffect()
      }
    },

    playSwingUpEffect() {
      const keyframes = [
        /*  0 */ 0.0, //s
        /*  1 */ 0.2, //s
        /*  2 */ 0.25, //s
        /*  3 */ 0.35, //s
        /*  4 */ 0.4, //s
        /*  5 */ 0.5, //s
        /*  6 */ 0.55, //s
        /*  7 */ 0.65, //s
        /*  8 */ 0.7, //s
        /*  9 */ 0.75, //s
        /* 10 */ 0.9, //s
        /* 11 */ 1.1, //s
        /* 12 */ 1.25, //s
        /* 13 */ 1.42, //s
        /* 14 */ 1.6 //s
      ]
      const playspeed = 1
      const timespan = (start, end) => ({
        delay: (keyframes[start] - keyframes[4]) * (1 / playspeed),
        duration: (keyframes[end] - keyframes[start]) * (1 / playspeed)
      })
      const content = this.$refs.content
      gsap.to(content, {
        '--ratio-scale': 0.5,
        ease: 'elastic',
        ...timespan(4, 14)
      })
      gsap.to(content, {
        '--ratio-offset-y': 1,
        ease: 'none',
        ...timespan(4, 14)
      })
      gsap.to(content, {
        '--ratio-offset-x': 0.5,
        ease: 'sine.inOut',
        ...timespan(5, 8)
      })
      gsap.to(content, {
        '--ratio-offset-x': -0.25,
        ease: 'sine.inOut',
        ...timespan(8, 11)
      })
      gsap.to(content, {
        '--ratio-offset-x': 0.15,
        ease: 'sine.inOut',
        ...timespan(11, 13)
      })
      gsap.to(content, {
        '--ratio-offset-x': 0,
        ease: 'sine.inOut',
        ...timespan(13, 14)
      })
      gsap.to(content, {
        opacity: 0,
        ease: 'none',
        ...timespan(12, 14),
        onComplete: () => {
          this.destoryInstance()
        }
      })
    },

    destoryInstance() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style lang="stylus">
.click-effect
  position absolute
  pointer-events: none
  white-space: pre
  z-index: 202

.effect-content
  null

.type-plus-ones
  --content: '🐸 +1s'
  --color-primary: #eefae7
  --color-secondary: #383838
  --color-border: #cbe2bf
  --size: 20px
  --ratio-offset-y: 0
  --ratio-offset-x: 0
  --ratio-scale: 0
  background-color: var(--color-primary)
  border: 2px solid var(--color-border)
  position: absolute
  line-height: calc(var(--size) * 1.2)
  top: 50%
  left: 50%
  border-radius: 9999px
  transform: \
    translate(-50%, -70%) \
    translate(calc(var(--size) * var(--ratio-offset-x)), calc(var(--size) * -3 * var(--ratio-offset-y))) \
    rotate(calc(-20deg * var(--ratio-offset-x))) \
    scale(var(--ratio-scale)) \

  &:after
    content: var(--content)
    color: var(--color-secondary)
    font-size: var(--size)
    padding: 0.25em 0.5em

.type-text
  --size: 40px
  --ratio-offset-y: 0
  --ratio-offset-x: 0
  --ratio-scale: 0
  position: absolute
  line-height: calc(var(--size) * 1.2)
  top: 50%
  left: 50%
  font-size: var(--size)
  transform: \
    translate(-50%, -70%) \
    translate(calc(var(--size) * var(--ratio-offset-x)), calc(var(--size) * -3 * var(--ratio-offset-y))) \
    rotate(calc(-20deg * var(--ratio-offset-x))) \
    scale(var(--ratio-scale)) \

</style>
