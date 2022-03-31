<template lang="pug">
.tsi-main-menu( :class="{ 'is-show': value }" )
  client-only
    global-events(
      @keyup.esc="toggle(currentTabId)"
    )
  .menu-navbar.d-flex
    //- @TODO: Support icon morphing
    .shadow-handler.is-glass(
      @click="toggle(tab.id)"
      v-for="tab in tabs"
      :class="{ 'is-active': tab.id === currentTabId }"
    )
      //- @FIXME: dynamic disabled will position a wrong place
      el-tooltip(
        :content="tab.tooltip || tab.name"
        :disabled="!$tsi.isPlaying"
        :manual="tab.id === currentTabId"
        :value="tab.id !== currentTabId ? undefined : false"
      )
        //- @TODO: Switch a better perf way to apply distory
        //- SVG Filter + Transform will drop sketch fps
        cear-icon(
          circle
          fill="var(--secondary)"
          shadow="black"
          :enableDistort="false"
          :name="tab.id === currentTabId ? 'close-short-line' : tab.icon"
        )
  .menu-modal.d-flex.align-center.justify-center
    .modal-dialog-box

      transition( name="el-fade-in" )
        .menu-tab.tab-main( v-if="currentTabId === 'main'" )
          .tab-title {{ currentTab.name }}
          .menu-items
            cear-button( isBlock type="secondary" shadow="rgba(var(--brand-rgb), 0.6)" @click="hide" size="big" )
              | {{ $tsi.cachedContext.hasFinishedOnboard ? $t('tsi.menu.continue') : $t('tsi.menu.start') }}
            //- cear-button( isBlock type="secondary-ghost" shadow="rgba(var(--brand-rgb), 0.6)" @click="showIntroModal" size="big" ) {{ $t('tsi.menu.intro') }}
            .setting-item.handler.d-flex.justify-space-between.align-center(
              @click="handleToggleSoundClick"
            )
              .left-part.d-flex.align-center.flex-shrink-0.ml-1
                .volume-icon-wrapper(
                  :class="{ 'is-muted': $tsi.cachedContext.isMuteAudio }"
                )
                  cear-icon(
                    fill="var(--secondary)"
                    size="2em"
                    :enableDistort="false"
                    :enableDistortTransform="false"
                    :name="'volume-mute'"
                  )
                  .sound-wave.wave-one
                  .sound-wave.wave-two
                //- | {{ $t('tsi.menu.sound') }}

              .control-part.d-flex.align-center.mr-3
                //- el-switch(
                //-   :value="!$tsi.cachedContext.isMuteAudio"
                //- )
                cear-sine-wave(
                  isLine :lineWidth="2"
                  needTransition
                  :needAnimate="false"
                  :isFlat="$tsi.cachedContext.isMuteAudio"
                  color="rgba(var(--secondary-rgb), 0.0)"
                  colorB="rgba(var(--secondary-rgb), 0.7)"
                  amplitudeX="10%"
                  :amplitudeY="30"
                )

      transition( name="el-fade-in" )
        .menu-tab.tab-map( v-if="currentTabId === 'map'" )
          tsi-mini-map

      transition( name="el-fade-in" )
        .menu-tab.tab-story( v-if="currentTabId === 'story'" )
          //- .tab-title {{ currentTab.name }}
          cear-story(
            ref="story"
            :needAnimate="false"
            :roles="storyRoles"
            :initialMessages="storyMessages"
            @messageUpdated="({ messages }) => $tsi.storyMessages = messages"
            scrollHeight="75vh"
          )
</template>

<script>
const DEFAULT_TAB_ID = 'main'

export default {
  props: {
    value: {
      type: [Boolean]
    },
    storyRoles: {
      type: Array
    },
    storyMessages: {
      type: Array
    }
  },

  model: {
    prop: 'value'
  },

  data() {
    return {
      tabs: [
        { name: this.$t('story.history'), id: 'story', icon: 'chat-history-fill' },
        { name: '', tooltip: this.$t('tsi.menu.map'), id: 'map', icon: 'treasure-map-fill' },
        { name: this.$t('tsi.title'), tooltip: this.$t('tsi.menu.setting'), id: 'main', icon: 'settings-2-fill' },
      ],
      currentTabId: null
    }
  },

  computed: {
    currentTab() {
      return this.tabs.find(el => el.id === this.currentTabId)
    }
  },

  watch: {
    value() {
      this._toggleBodyClass()
    }
  },

  created() {
    this._injectInitedClass()

    if (this.value) {
      this._toggleBodyClass()
      this.currentTabId = DEFAULT_TAB_ID
    }
  },

  activated() {
    this._injectInitedClass()
    this._toggleBodyClass()
  },

  methods: {
    _injectInitedClass() {
      // @FIXME: Should dispatch classStatus event via eventBus
      if (process.client) {
        setTimeout(() => {
          document.querySelector('.page-wrapper')?.classList.add('is-inited-sketch')
        }, 50)
      }
    },

    _toggleBodyClass() {
      if (process.client) {
        setTimeout(() => {
          const $wrapper = document.querySelector('.page-wrapper')
          $wrapper.classList.toggle('is-main-menu-opened', this.value)
        }, 10)
      }
    },

    handleToggleSoundClick() {
      this.$tsi.cachedContext.isMuteAudio = !this.$tsi.cachedContext.isMuteAudio
    },

    showIntroModal() {
      // @TODO
    },

    show(tabId) {
      this.currentTabId = tabId || DEFAULT_TAB_ID
      this.$emit('input', true)
    },

    hide() {
      setTimeout(() => {
        this.currentTabId = null
        this.$emit('input', false)
      })
    },

    toggle(tabId = DEFAULT_TAB_ID) {
      if (this.$tsi.isShowPopup) {
        return
      }

      if (this.value && tabId === this.currentTabId) {
        this.hide()
      } else {
        this.show(tabId)
      }
    }
  }
}
</script>

<style lang="stylus">
// Set navbar transitoion
.is-tsi-wrapper.is-inited-sketch
  overflow-y: hidden

  .site-navbar
    transition: 500ms
    pointer-events: none
    opacity: 0
    transform: translateY(-24px) scale(0.85)

  // navbar secondary theme
  .nav-list,
  .nav-item.nuxt-link-active .item-text
    filter: invert(100)

  &.is-main-menu-opened
    .site-navbar
      opacity 1
      pointer-events: initial
      transform: translateY(0%) scale(1)

.tsi-main-menu
  $z-index = 10
  .menu-navbar
    position: absolute
    z-index: ($z-index + 1)
    top: 2rem
    right: 2rem
    font-size: s('min(8vw, 45px)')
    pointer-events: initial
    max-width: 30vw
    justify-content: flex-end
    flex-wrap: wrap

    .shadow-handler
      margin-left: 1rem
      transform: translate3d(0,0,0)

  .menu-modal
    transition: 1000ms
    position absolute
    inset: 0
    background-color: secondary(0)
    pointer-events: none

  .modal-dialog-box
    margin: 24px

  .menu-items
    .el-button
      width: 100%

    .cear-sine-wave
      width: 168px
      margin-left: -12px

    .setting-item
      padding-top: 4px
      font-size: 20px
      font-weight: 500

      .control-part
        min-height: 32px

      .svg-symbol
        opacity: 0.6
        font-size: 30px

    .cear-button,
    .setting-item
      min-width: 200px
      margin-bottom: 12px

    .volume-icon-wrapper
      position relative
      line-height: 1
      padding-right: 10px

      $border = 2px
      $color = $secondary

      .sound-wave
        position: absolute
        border: $border solid transparent
        border-right: $border solid $color
        border-radius: 50%
        transition: all 260ms
        margin: auto
        top: -2px
        bottom: 0
        left: 0
        right: 0
        opacity: 0.5

      .wave-one
        width: 50%
        height: 50%

      .wave-two
        width: 75%
        height: 75%
        transition-delay: 150ms

      &.is-muted
        .wave-one,
        .wave-two
          opacity: 0
          transition-delay: 0ms

        .wave-one
          transition-delay: 150ms

  .menu-tab
    position absolute
    width: 100%
    left: 50%
    top: 50%
    transform: translate3d(-50%, -50%, 0)
    display: flex
    flex-direction: column
    align-items: center

  .tab-title
    color: $secondary
    margin-bottom: 20px

  .tab-story
    padding-top: var(--header-height)

    .cear-story .scrollable-y
      padding-bottom: 80px

  .tab-main
    top: 50%
    color: $secondary

    > *
      opacity: 0.9

    glow-text-shadow()
      $color = brand(50)
      text-shadow:
        1px 1px 2px primary(50),
        0 0 5px secondary(60),
        0 0 10px secondary(60),
        0 0 15px secondary(60),
        0 0 20px $color,
        0 0 35px $color,
        0 0 40px $color,
        0 0 50px $color

    glow-text-shadow-b()
      $color = brand(50)
      text-shadow:
        1px 1px 2px primary(50),
        0 0 5px secondary(60),
        0 0 10px secondary(60),
        0 0 15px secondary(60),
        0 0 20px $color,
        0 0 35px $color,
        0 0 40px $color,
        0 0 50px $color

    .el-button
      font-weight: 400 !important
      color: primary(70) !important
      text-shadow:
        1px 1px 2px brand(50),
        0 0 5px secondary(60),
        0 0 10px secondary(60),
        0 0 15px secondary(60),
        0 0 20px brand(50),
        0 0 35px brand(50),
        0 0 40px brand(50),
        0 0 50px brand(50)

      &.el-button--secondary-ghost
        background-color: secondary(5)
        color: secondary(70) !important
        text-shadow: 0 0 5px secondary(60)

    @keyframes text-glow
      from
        glow-text-shadow()
      to
        glow-text-shadow-b()

    .tab-title
      font-family: var(--fonts-title)
      font-size: s('max(2.5vw, 40px)')
      font-weight: 300
      margin-bottom: 30px
      animation: text-glow 1s linear infinite alternate
      will-change: text-shadow

  .cear-story
    max-width: 800px
    width: 100%
    padding: 0 24px

  &.is-show
    .menu-modal
      z-index: $z-index
      pointer-events: initial
      background-color: primary(30)
</style>
