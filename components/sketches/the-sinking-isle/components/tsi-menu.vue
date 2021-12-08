<template lang="pug">
.tsi-main-menu( :class="{ 'is-show': value }" )
  client-only
    global-events(
      @keyup.esc="toggle(currentTabId)"
    )
  .menu-navbar.d-flex
    //- @TODO: Support icon morphing
    .shadow-handler.is-grass(
      @click="toggle(tab.id)"
      v-for="tab in tabs"
      :class="{ 'is-active': tab.id === currentTabId }"
    )
      el-tooltip(
        :content="tab.tooltip || tab.name"
        :disabled="tab.id === currentTabId"
      )
        //- @TODO: Switch a better perf way to apply distory
        //- SVG Filter + Transform will drop sketch fps
        cear-icon(
          circle
          fill="var(--secondary)"
          shadow="black"
          :enableDistort="false"
          :enableDistortTransform="false"
          :name="tab.id === currentTabId ? 'close-short-line' : tab.icon"
        )
  .menu-modal.d-flex.align-center.justify-center
    .modal-dialog-box
      transition( name="el-fade-in" )
        .menu-tab.tab-main( v-if="currentTabId === 'main'" )
          .tab-title {{ currentTab.name }}
          .menu-items
            cear-button( isBlock type="secondary" shadow="rgba(var(--brand-rgb), 0.6)" @click="hide" size="big" )
              | {{ $parent.cachedContext.hasFinishedOnboard ? $t('tsi.menu.continue') : $t('tsi.menu.start') }}
            //- cear-button( isBlock type="secondary-ghost" shadow="rgba(var(--brand-rgb), 0.6)" @click="showIntroModal" size="big" ) {{ $t('tsi.menu.intro') }}
            .setting-item.d-flex.justify-space-between.align-center(
              @click="handleToggleSoundClick"
            )
              .left-part.d-flex.align-center.flex-shrink-0.ml-1
                cear-icon(
                  fill="var(--secondary)"
                  :enableDistort="false"
                  :enableDistortTransform="false"
                  :name="$parent.cachedContext.isMuteAudio ? 'volume-mute-fill' : 'volume-up-fill'"
                )
                //- | {{ $t('tsi.menu.sound') }}

              .control-part.d-flex.align-center.mr-3
                //- el-switch(
                //-   :value="!$parent.cachedContext.isMuteAudio"
                //- )
                cear-sine-wave(
                  isLine :lineWidth="2"
                  needTransition
                  :needAnimate="false"
                  :isFlat="$parent.cachedContext.isMuteAudio"
                  color="rgba(var(--secondary-rgb), 0.0)"
                  colorB="rgba(var(--secondary-rgb), 0.7)"
                  amplitudeX="10%"
                  :amplitudeY="30"
                )
      transition( name="el-fade-in" )
        .menu-tab.tab-story( v-if="currentTabId === 'story'" )
          //- .tab-title {{ currentTab.name }}
          cear-story(
            ref="story"
            :needAnimate="false"
            :roles="storyRoles"
            :initialMessages="storyMessages"
            @messageUpdated="({ messages }) => $parent.storyMessages = messages"
            scrollHeight="75vh"
          )
</template>

<script>
const DEFAULT_TAB_ID = 'story'

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
        { name: this.$t('tsi.title'), tooltip: this.$t('tsi.menu.setting'), id: 'main', icon: 'settings-2-fill' }
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
      this.$parent.cachedContext.isMuteAudio = !this.$parent.cachedContext.isMuteAudio
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
  .menu-navbar
    position: absolute
    z-index: 2
    top: 2rem
    right: 2rem
    font-size: s('min(6vw, 45px)')
    pointer-events: initial

    .cear-icon
      margin-left: 1rem

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
      width: 170px
      margin-left: -8px

    .setting-item
      cursor: pointer
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
      null

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
      pointer-events: initial
      background-color: primary(30)
</style>
