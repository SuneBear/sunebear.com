<template lang="pug">
page-wrapper(
  name="about"
)
  .section
    .container
      nuxt-content-card(
        :content="nuxtContent"
      )
</template>

<script>
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
  }

}
</script>

<style lang="stylus">
.page-about
  .nuxt-content-card
    .content-title
      font-weight: bold

</style>
