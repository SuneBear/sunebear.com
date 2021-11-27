<template lang="pug">
page-wrapper(
  name="blog"
)
  .section
    .container
      //- .text-h4.mb-8
      //-   cear-notation( isShow ) Blog

      .blog-list
        nuxt-content-card(
          v-for="nuxtContent in articles"
          isInList
          :content="nuxtContent"
        )
</template>

<script>
export default {

  head() {
    return {
      title: this.$t('nav.blog')
    }
  },

  async asyncData ({ $content }) {
    const articles = await $content('blog')
      .sortBy('date', 'desc')
      .fetch()

    return {
      articles
    }
  },

  data() {
    return {
      paperName: 'line'
    }
  }

}
</script>

<style lang="stylus">
.page-blog
  null
</style>
