<template lang="pug">
.sketch.sketch-the-sinking-isle(
)
  .dom-wrapper
  .canvas-wrapper(
    ref="canvasWrapper"
  )
</template>

<script>
import { __DEBUG__ } from '~/utils/dev'
import { loadingSketch } from './loading-2d-sketch'

export default {
  data(){
    return {
      isLoading: true,
      loadProgress: 0,
      isInited: false,
      isError: false,
      isPlaying: true,
      isMuteAudio: true,
    }
  },

  computed: {
    enableDebug() {
      return __DEBUG__ || this.$route.query.debug
    }
  },

  watch: {
    loadProgress() {
      if (this.loadProgress >=1) {
        console.log('Sketch loaded')
        loadingSketch.destory()
      }
    }
  },

  mounted() {
    this.initSketch()
  },

  activated() {
    if (!this.isLoading) {
      this.isPlaying = true
    }
  },

  deactivated() {
    this.isPlaying = false
  },

  methods: {
    async initSketch () {
      if (this.isInited) {
        return
      }

      loadingSketch.init({
        container: this.$refs.canvasWrapper,
        $vm: this
      })
      this.isError = false
      this.isLoading = true

      try {
        window.TONE_SILENCE_LOGGING = true
        // Export sketch to window
        const { theSinkingIsleSketch } = await import('./sketch')
        window.theSinkingIsleSketch = theSinkingIsleSketch
        await theSinkingIsleSketch.init({
          container: this.$refs.canvasWrapper,
          $vm: this
        })
        this.isInited = true
      } catch(error) {
        console.log('Init sektch error', error)
        this.isError = true
      }

      this.isLoading = false
    }
  }
}
</script>

<style lang="stylus">
.sketch-the-sinking-isle
  width: 100vw
  height: 100vh

  > *,
  .canvas-wrapper canvas
    position: absolute
    width: 100%
    height: 100%
    left: 0
    top: 0
    transition: opacity 1000ms, transform 1000ms

    &.fade-out
      opacity: 0
      transform: scale(1.5)

  .dom-wrapper
    z-index: 2
    pointer-events: none

  .canvas-wrapper
    canvas:first-child
      z-index: 2

</style>
