<template lang="pug">
.page-wrapper.scrollable-container(
  :class="[ 'ref-page-' + name ]"
  v-infinite-scroll="handleLoadMore"
  infinite-scroll-disabled="disableLoadMore"
  :infinite-scroll-distance="1500"
  @scroll="handleScroll"
)
  site-navbar(
    v-if="$parent.isShowHeader"
    :scrollTop="lastScrollTop"
    :scrollLeft="lastScrollLeft"
    :isScrolling="isScrolling"
  )

  cear-paper(
    :name="$parent.paperName"
    v-bind="$parent.paperOptions"
  )
    .page(
      :class="[ 'page-'+ name, rootClass ]"
    )
      slot( v-if="ssr" )
      client-only( v-else )
        slot

  site-footer(
    v-if="$parent.isShowFooter"
    :isShowSns="$parent.isShowFooterSns"
  )

</template>

<script>
import throttle from 'lodash.throttle'
import { debugCreator } from '~/utils/dev'

export default {
  props: {
    name: {
      type: String
    },
    ssr: {
      tyep: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'default'
    },
    rootClass: {
      type: Object
    },
    enableLoadMore: {
      type: Boolean,
      default: true
    }
  },

  head() {
    const isSafari = this.isSafari
    return {
      bodyAttrs: {
        class: `v-application theme-${this.theme} ${isSafari && 'is-in-safari'}`
      }
    }
  },

  data() {
    return {
      lastScrollTop: 0,
      lastScrollLeft: 0,
      isScrolling: false,
      isRefreshing: false
    }
  },

  computed: {
    disableLoadMore() {
      return !this.enableLoadMore
    }
  },

  activated() {
    window.$page = this.$parent

    if (this.lastScrollTop) {
      this.$el.scrollTop = this.lastScrollTop
    }
    setTimeout(() => {
      this.lastScrollLeft = localStorage.getItem('lastScrollLeft')
      if (this.lastScrollLeft) {
        this.$el.scrollLeft = this.lastScrollLeft
      }
    })
  },

  mounted() {
    this.pageDebug = debugCreator(this.name)
    this.pageDebug('page instance', this.$parent)
  },

  methods: {
    handleLoadMore() {
      this.$emit('loadMore')
    },

    handleScroll: throttle(function(event) {
      this.lastScrollTop = event.target.scrollTop
      this.$parent.simulateScrollTop = this.lastScrollTop

      this.lastScrollLeft = event.target.scrollLeft
      localStorage.setItem('lastScrollLeft', this.lastScrollLeft)

      this.isScrolling = true
      window.clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false
      }, 300)

      this.$emit('scroll', { scrollTop: event.target.scrollTop })
    }, 100)

  }
}
</script>

<style lang="stylus">
.page-wrapper
  position relative
  overflow-y auto
  -webkit-overflow-scrolling: touch

  .height-limiter
    min-height: 100%

.page
  null
</style>
