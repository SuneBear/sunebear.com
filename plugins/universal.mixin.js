import Vue from 'vue'
import { isSafari, isMobile } from '~/utils/env'

const NAVBAR_OFFSET = 70

const componentMixin = {
  data() {
    return {
      paperName: 'solar-dotted',
      isSafari: isSafari(this.$ua?.original()),
      isMobile: isMobile(this.$ua?.original()),
      isShowHeader: true,
      isShowFooter: true
    }
  },

  transition: {
    // name: "el-fade-in",
    // duration: 1000
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.isPage = true
    })
  },

  activated() {
    if (this.isPage) {
      this.scrollToSection(this.$route.query.section)
    }
  },

  beforeRouteUpdate(to, from, next) {
    if (!this || !this.$route) {
      return
    }

    this.firstfromPageName = from.name || localStorage.getItem(vm._uid)

    if (to.query.section) {
      this.scrollToSection(to.query.section)
    }

    next()
  },

  methods: {
    scrollToSection(sectionName) {
      const $page = document.querySelector('.page-wrapper')
      const $section = sectionName === 'top' ? $page : document.querySelector(
        `.section-${sectionName}`
      )

      if (!$page || !$section) {
        return
      }

      $page.scrollTo(0, $section.offsetTop - NAVBAR_OFFSET)

      const nextQuery = {
        ...this.$route.query
      }

      if (sectionName !== 'top') {
        // analytics.screen(sectionName)
      }

      delete nextQuery.section

      setTimeout(() => {
        try {
          this.$router.replace({
            path: this.$route.path,
            query: nextQuery
          })
        } catch (error) {}
      }, 50)
    }
  }

}

Vue.mixin(componentMixin)
