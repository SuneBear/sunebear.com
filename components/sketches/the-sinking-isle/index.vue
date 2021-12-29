<template lang="pug">
.sketch.sketch-the-sinking-isle(
)
  .dom-wrapper(
    :class="{ 'is-inited': isInited, 'is-show-menu': isShowMainMenu }"
  )
    tsi-menu(
      v-if="isInited"
      v-model="isShowMainMenu"
      :storyRoles="storyRoles"
      :storyMessages="storyMessages"
    )
    cear-story.is-absolute-center(
      ref="story"
      enableActionBar
      :needAnimate="true"
      :roles="storyRoles"
      :initialMessages="storyMessages"
      @messageSent="({ messages }) => storyMessages = messages"
      @messageClearAll="() => storyMessages = []"
      scrollHeight="50vh"
    )
    .sketch-title.is-absolute-center {{ $t('tsi.title') }}
  .canvas-wrapper(
    ref="canvasWrapper"
  )
</template>

<script>
import { __DEBUG__ } from '~/utils/dev'
import { loadingSketch } from './loading-2d-sketch'

const CONTEXT_CACHE_KEY = 'TSI/Context'
const STORY_MESSAGES_CACHE_KEY = 'TSI/StoryMessages'

export default {
  data(){
    return {
      isNeedLoading: !__DEBUG__,

      /*==== Context States & Data ====*/
      // System States
      isLoading: true,
      loadProgress: 0,
      isInited: __DEBUG__,
      isError: false,
      isPlaying: true,

      // UI
      isShowMainMenu: !__DEBUG__,
      isSwitchingScene: false,
      isPlayingCutscene: false,
      panOffset: {
        x: 0,
        y: 0
      },

      // Runtime
      isForcePushingPlayer: false,
      enablePlayerDrift: false,
      cameraTarget: 'player',

      /*==== Persistent Context States & Data ====*/
      cachedContext: {
        // Settings
        isMuteAudio: false,

        // Runtime
        hasFinishedOnboard: false
      },
      storyRoles: [],
      storyMessages: []
    }
  },

  computed: {
    enableDebug() {
      return __DEBUG__ || this.$route.query.debug
    },

    enableUserInput() {
      return (
        !this.isPlayingCutscene &&
        !this.isSwitchingScene &&
        !this.isShowMainMenu
      )
    },

    enableUserMoveInput() {
      return (
        this.enableUserInput &&
        !this.isForcePushingPlayer
      )
    },

    isShowPanel() {
      return (
        this.isShowMainMenu
      )
    }
  },

  watch: {
    loadProgress() {
      if (this.loadProgress >=1) {
        this.handleLoaded()
      }
    },

    cachedContext: {
      deep: true,
      handler () {
        localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(this.cachedContext))
      }
    },

    storyMessages() {
      localStorage.setItem(STORY_MESSAGES_CACHE_KEY, JSON.stringify(this.storyMessages))
    },

    isShowMainMenu() {
      // this.startOnboard()
      // console.log('isShowMainMenu', this.isShowMainMenu)
    }
  },

  activated() {
    if (!this.sketch) {
      this.initSketch()
    } else {
      this.sketch.sizes.resize()
    }

    if (!this.isLoading) {
      this.isPlaying = true
    }
  },

  deactivated() {
    this.isPlaying = false
  },

  methods: {
    async initSketch () {
      if (this.isInited && !this.enableDebug) {
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
        this.initContextData()
        window.TONE_SILENCE_LOGGING = true
        // Export sketch to window
        const { theSinkingIsleSketch } = await import('./sketch')
        this.sketch = window.sketch = window.theSinkingIsleSketch = theSinkingIsleSketch
        await theSinkingIsleSketch.init({
          container: this.$refs.canvasWrapper,
          $vm: this
        })
      } catch(error) {
        console.log('Init sektch error', error)
        this.isError = true
      }

      this.isLoading = false
    },

    async initContextData() {
      let storyMessages = [
        { user: 'bear', message: '> Hello from SuneBear. \n\n Welcome to chat with me'  },
        { user: 'user', message: 'You know who i am?'  },
        { user: 'bear', message: 'I guess you are a kind people'  }
      ]

      if (process.client && localStorage.getItem(CONTEXT_CACHE_KEY)) {
        const context = JSON.parse(localStorage.getItem(CONTEXT_CACHE_KEY))
        Object.assign(this.cachedContext, context)
      }

      if (process.client && localStorage.getItem(STORY_MESSAGES_CACHE_KEY)) {
        const localMessages = JSON.parse(localStorage.getItem(STORY_MESSAGES_CACHE_KEY))
        if (localMessages.length) storyMessages = localMessages
      }

      this.storyRoles = [
        { name: 'bear', avatar: require('@/assets/story/bear14-avatar3.png'), isDefault: true }
      ]

      this.storyMessages = storyMessages

      this.$story = this.$refs.story
    },

    startOnboard() {
      if (this.isShowMainMenu || this.cachedContext.hasFinishedOnboard || !this.isInited) {
        return
      }

      this.$story.add({
        user: 'system', message: 'Onboard', autoSwitch: false,
        actions: [ { type: 'reply', text: 'test', responsive: 'responsive' } ]
      })

      // this.cachedContext.hasFinishedOnboard = true
    },

    async handleLoaded() {
      console.log('Sketch loaded')
      await loadingSketch.destory()
      this.isInited = true
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
      transform: scale(1)

  .dom-wrapper
    z-index: $zIndexSketchUI
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

    > .cear-story
      position: fixed
      padding: 0 24px
      max-width: 800px
      transform: translate3d(-50%, 0, 0)
      left: 50%
      bottom: 0

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
