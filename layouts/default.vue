<template lang="pug">
.limit-layout.default-layout(
  :class="[ `ref-page-${pageName}` ]"
)
  transition( :duration="pageTransitionDuration" )
    nuxt(
      ref="pageWrapper"
      keep-alive
    )
  ink-svg-filters
</template>

<script>
import { debugCreator } from '@/utils/dev'

const layoutDebug = debugCreator('Layout')

export default {
  data() {
    return {
      page: {},
      pageTransitionDuration: 1000,
      isShowStaticFrame: false
    }
  },

  computed: {
    pageName() {
      return this.$route.name
    },
    paperName() {
      return (this.pageName && this.page?.paperName) || 'dotted'
    }
  },

  watch: {
    $route() {
      this.setCurrentPage()
    }
  },

  mounted() {
    this.setCurrentPage()
  },

  methods: {
    setCurrentPage() {
      setTimeout(() => {
        this.page = this.$refs.pageWrapper.$children[0]
        layoutDebug('Current page', this.page)
      })
    }
  }
}
</script>

<style lang="stylus">
.default-layout
  width: 100vw
  height: 100vh

  .global-frame
    .mask-wrapper
      background-color: primary(5)

    &,
    .inner-content
      width: 100%
      height: 100%

    .inner-content
      overflow-y: auto

.page
  padding: 30px 10px
  min-height: 100%

  \.global-frame.is-show-static-frame &
    padding: 60px 20px 100px

// Tweakpane
.tp-dfwv
  left: 8px
  z-index: 23333
</style>
