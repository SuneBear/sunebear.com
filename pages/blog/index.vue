<template lang="pug">
page-wrapper(
  name="blog"
)
  .section
    .container
      | Blog
</template>

<script>
export default {

  head() {
    return {
      title: 'Blog'
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
