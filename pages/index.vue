<template lang="pug">
page-wrapper(
  name="index"
)
  the-sinking-isle
</template>

<script>
export default {

  data() {
    return {
      paperName: 'secondary'
    }
  },

  head() {
    return {
      title: this.$t('tsi.sketch.title')
    }
  }

}
</script>

<style lang="stylus">
.page-index
  null
</style>
