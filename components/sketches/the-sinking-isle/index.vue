<template lang="pug">
.sketch.sketch-the-sinking-isle(
)
  .dom-wrapper(
    :class="domWrapperClass"
    ref="domWrapper"
  )
    client-only(
      v-if="isInited"
    )
      tsi-menu(
        v-model="isShowMainMenu"
        :storyRoles="storyRoles"
        :storyMessages="storyMessages"
      )
      tsi-interaction(
        v-if="$tsi.cursor"
      )
      tsi-chapter-control
      tsi-inventory
    .dom-renderer( ref="domRenderer" )
    cear-story.is-absolute-center(
      :class="{ 'is-show': !isShowMainMenu }"
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
import Vue from 'vue'
import { __DEBUG__ } from '~/utils/dev'
import { getFormattedDate } from '~/utils/time'
import { loadingSketch } from './loading-2d-sketch'

const CONTEXT_CACHE_KEY = 'TSI/Context'
const STORY_MESSAGES_CACHE_KEY = 'TSI/StoryMessages'

// @Hack: Mount $tsi vm to global, treat as $root singleton
Vue.prototype.$tsi = {}

export default {
  data(){
    return {
      isNeedLoading: !__DEBUG__,

      /*==== Context States & Data ====*/
      // System States
      isLoading: false,
      loadProgress: 0,
      isInited: __DEBUG__,
      isError: false,
      isPlaying: true,

      // UI
      isShowMainMenu: !__DEBUG__,
      isShowNotebookPopup: false,
      isSwitchingChapter: false,
      isPlayingCutscene: false,
      isPressed: false,
      cursor: {
        x: 0,
        y: 0
      },
      panOffset: {
        x: 0,
        y: 0
      },

      // Runtime
      // @values: main | suneBearHome
      currentChapter: 'main',
      // This will do a batch updates for runtime states, listen this in spec modules
      // @values: swim | viewSpark
      currentActionMode: 'swim',

      isForcePushingPlayer: false,
      enablePlayerDrift: false,
      // @values: player | Vector3
      cameraTarget: 'player',

      /*==== Persistent Context States & Data ====*/
      cachedContext: {
        // Settings
        isMuteAudio: false,

        // Stats
        firstVisitTime: null,
        sparkWishBeaconVisitTime: null,
        tourDistance: 0,

        // Runtime
        hasFinishedOnboard: false,
        hasShownBoundaryStory: false,
        hasVisitedSuneBearHome: false
      },
      storyRoles: [],
      storyMessages: []
    }
  },

  computed: {
    domWrapperClass() {
      return {
        'is-inited': this.isInited,
        'is-show-menu': this.isShowMainMenu,
        'has-inventory-toolbar': this.hasInventoryToolbar
      }
    },

    enableDebug() {
      return __DEBUG__ || this.$route.query.debug
    },

    enableUserInput() {
      return (
        !this.isPlayingCutscene &&
        !this.isSwitchingChapter &&
        !this.isShowMainMenu
      )
    },

    enableUserMoveInput() {
      return (
        this.enableUserInput &&
        this.currentChapter === 'main' &&
        this.currentActionMode === 'swim' &&
        !this.isForcePushingPlayer
      )
    },

    hasInventoryToolbar() {
      return this.currentActionMode === 'viewSpark'
    },

    isShowPopup() {
      return this.isShowNotebookPopup
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
      this.startOnboard()
    }
  },

  beforeMount() {
    Vue.prototype.$tsi = this

    if (this.$route.query.island) {
      this.isShowMainMenu = false
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
      if (module && module.hot) {
        // @FIXME: Support HMR for three.js
        module.hot.dispose(() => {
          location.reload()
        })
      }

      if (this.isLoading || (this.isInited && !this.enableDebug)) {
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
      this.cachedContext.firstVisitTime = Date.now()

      let storyMessages = [
        { user: 'system', message: this.$t('story.system.firstVisitDate', { date: getFormattedDate(this.cachedContext.firstVisitTime) })  },
        { user: 'bear', message: this.$t('story.system.onboardingWelcomeWord.main') },
        { user: 'user', message: this.$t('story.system.onboardingWelcomeWord.replyWhoIam') },
        { user: 'bear', message: this.$t('story.system.onboardingWelcomeWord.youAreCurious') }
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
      if (this.isShowMainMenu || this.cachedContext.hasFinishedOnboard || !this.isInited || this.$route.query.island) {
        return
      }

      this.$story.add([
        {
          user: 'system',
          message: this.$t('story.system.onboardingMoveTips.main'),
          switchDelay: 5000
        },
        {
          user: 'system',
          message: this.$t('story.system.onboardingMoveTips.closeToken')
        }
      ])

      this.cachedContext.hasFinishedOnboard = true
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
$inventoryToolbarHeight = 86px
$secondaryBgOpacity = 0.8

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
      position: absolute
      top: auto
      padding: 0 24px
      max-width: 800px
      transform: translate3d(-50%, 0, 0)
      left: 50%
      bottom: 24px
      transition: 418ms
      opacity: 0

      &.is-show
        opacity: 1

      .story-action-bar
        // right: 50%
        // transform: translateX(50%)
        bottom: 0
        opacity: $secondaryBgOpacity
        transform: scale(0.8)

        > *
          pointer-events: auto

    &.has-inventory-toolbar > .cear-story
      bottom: $inventoryToolbarHeight

    .sketch-title
      display: none
      font-weight: 100
      font-size: 28px
      margin-top: -10px

      /[lang="zh-Hans"] &
        font-size: 24px

    .dom-renderer
      .attention-indicator
        opacity: $secondaryBgOpacity

      .cear-message-bubble
        // opacity: 0.95

      .el-popover.message-bubble-popover
        transform: translate(-50%, -100%) translate(0, -40px)

      > *
        pointer-events: auto

    .cear-message-bubble
      .cear-icon
        font-size: 1.4em
        vertical-align: sub

      &.is-system .bubble-content,
      &.is-me .bubble-content
        color: secondary(90)

        .typing-indicator
          filter: invert(100)

  .canvas-wrapper
    canvas:first-child
      z-index: 2

</style>
