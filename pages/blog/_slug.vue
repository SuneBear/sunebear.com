<template lang="pug">
page-wrapper(
  name="blog-article"
)
  .section
    .container.action-container
      cear-button(
        icon="close-line"
        circle
        border="var(--primary)"
        :shadow="null"
        @click="handleTitleClick"
      )
    .container
      nuxt-content-card(
        :content="nuxtContent"
        :onTitleClick="handleTitleClick"
      )
</template>

<script>
export default {

  head() {
    return {
      title: this.nuxtContent.title
    }
  },

  async asyncData ({ $content, params }) {
    const nuxtContent = await $content('blog', params.slug).fetch()

    return {
      nuxtContent
    }
  },

  data() {
    return {
      paperName: 'secondary'
    }
  },

  methods: {
    handleTitleClick() {
      this.$router.push('/blog')
    }
  }

}
</script>

<style lang="stylus">
.page-blog-article
  .action-container
    position relative
    padding: 0

    .cear-button
      position absolute
      right: 12px
      top: s('calc(var(--header-height) * -1)')
      margin-top: 44px

      @media print
        display: none
</style>
