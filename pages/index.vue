<template lang="pug">
page-wrapper(
  name="index"
  :class="{ 'is-tsi-wrapper': true }"
)
  the-sinking-isle
</template>

<script>
export default {

  data() {
    return {
      paperName: 'secondary',
      isShowFooter: false
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
