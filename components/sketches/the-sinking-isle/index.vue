<template lang="pug">
.sketch.sketch-the-sinking-isle(
)
  .dom-wrapper( :class="{ 'is-inited': isInited }" )
    .sketch-title.is-absolute-center {{ $t('tsi.sketch.title') }}
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
      isNeedLoading: !__DEBUG__,
      isLoading: true,
      loadProgress: 0,
      isInited: false,
      isError: false,
      isPlaying: true,
      isMuteAudio: false,
      enableUserInput: true,
      enablePlayerDrift: false,
      cameraTarget: 'player'
    }
  },

  computed: {
    enableDebug() {
      return __DEBUG__ || this.$route.query.debug
    },

    enableUserMove() {
      return this.enableUserInput
    },

    isShowPanel() {
      return false
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

      if (this.isNeedLoading) {
        loadingSketch.init({
          container: this.$refs.canvasWrapper,
          $vm: this
        })
      }
      this.isError = false
      this.isLoading = true

      try {
        window.TONE_SILENCE_LOGGING = true
        // Export sketch to window
        const { theSinkingIsleSketch } = await import('./sketch')
        window.sketch = window.theSinkingIsleSketch = theSinkingIsleSketch
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
  position absolute
  width: 100%
  height: 100%
  left: 0
  top: 0
  user-select none

  > *,
  .canvas-wrapper canvas
    position: absolute
    width: 100%
    height: 100%
    left: 0
    top: 0
    transition: opacity 1000ms, transform 1000ms
    &.fade-out
      will-change: transform, opacity
      opacity: 0
      transform: scale(1.5)

  .dom-wrapper
    z-index: 233
    pointer-events: none
    color: #383838
    opacity: 0

    &.is-inited
      opacity: 1

    .is-absolute-center
      position: absolute
      top: 50%
      left: 50%
      transform: translate3d(-50%, 50%, 0)

    .sketch-title
      display: none
      font-weight: 100
      font-size: 28px
      margin-top: -10px

      /[lang="zh-Hans"] &
        font-size: 24px

  .canvas-wrapper
    canvas:first-child
      z-index: 2

</style>
