<template lang="pug">
.quick-reader-container(
  :class="[ `type-${container}` ]"
)
  .quick-reader(
    :data-text="currentText"
  ) {{ currentText }}
</template>

<script>
const DEFAULT_TEXT = '· · ·'

export default {

  props: {
    content: {
      type: [ String, Array ],
      default: DEFAULT_TEXT
    },

    container: {
      type: String,
      default: undefined
    },

    skip: {
      type: Number,
      default: 4
    },

    speed: {
      type: Number,
      default: 450
    }
  },

  data () {
    return {
      counter: 0
    }
  },

  computed: {
    currentText () {
      const { skip, content, counter } = this
      let text

      if (Array.isArray(content)) {
        text = content[counter]
      } else {
        text = content.substring(counter, counter + skip)
      }

      return text || DEFAULT_TEXT
    }
  },

  beforeMount() {
    this.startCounterLoop()
  },

  beforeDestroy() {
    this.stopCounterLoop()
  },

  methods: {

    startCounterLoop() {
    const { content, speed, skip, counter } = this
    let nextCounter = counter

    if (this.counterLoopTimer) {
      return
    }

    this.counterLoopTimer = window.setInterval(() => {
      if (Array.isArray(content)) {
        nextCounter++
      } else {
        nextCounter += skip
      }

      if (nextCounter > content.length) {
        nextCounter = 0
      }

      this.counter = nextCounter
    }, speed)
    },

    stopCounterLoop() {
      if (this.counterLoopTimer) {
        window.clearInterval(this.counterLoopTimer)
        this.counterLoopTimer = null
      }
    }
  }

}
</script>

<style lang="stylus">
.quick-reader
  --size: 20px
  --color1: $brand
  --color2: $yellow
  --blend: screen
  --font-weight: 300
  --animation: glitch 0.5s infinite linear

  &-container
    &.type-mp3
      width: 200px
      padding: 20px
      background: black

  position: relative
  width: 100%
  height: var(--size)
  line-height: @height
  color: var(--color1)
  opacity: 0.95

  &,
  &:before
    font-weight: var(--font-weight)
    font-size: var(--size)
    text-align: center
    letter-spacing: 2px

  &:before
    position: absolute
    content: attr(data-text)
    color: var(--color2)
    opacity: 0.8
    mix-blend-mode: var(--blend)
    transform: translateX(-4px)
    animation: var(--animation)

  @keyframes glitch
    50%
      transform: translateX(5px)

</style>
