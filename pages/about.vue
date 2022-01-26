<template lang="pug">
page-wrapper(
  name="about"
)
  .section
    .container
      nuxt-content-card(
        :onTitleClick="handleTitleClick"
        :content="nuxtContent"
      )
</template>

<script>
import { emitClickEffect } from '~/components/uxs/click-effect'

let messageInstance = null

export default {

  head() {
    return {
      title: this.$t('nav.about')
    }
  },

  async asyncData ({ $content }) {
    const nuxtContent = await $content('about').fetch()

    return {
      nuxtContent
    }
  },

  methods: {
    handleTitleClick(event) {
      const isFirstClick = true || !localStorage.getItem('about/lastClickTitleTime')

      if (isFirstClick) {
        if (messageInstance && !messageInstance.closed) {
          messageInstance.clearTimer()
          messageInstance.startTimer()
        } else {
          messageInstance = this.$message.success({ message: this.$t('about.firstClickTitleTips'), customClass: 'single-line' })
        }
      }

      emitClickEffect({
        x: event.pageX,
        y: event.pageY
      })

      localStorage.setItem('about/lastClickTitleTime', Date.now())
    }
  }

}
</script>

<style lang="stylus">
.page-about
  .nuxt-content-card
    .content-title
      font-weight: bold
      user-select: none

</style>
