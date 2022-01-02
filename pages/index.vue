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
      title: this.$t('tsi.title')
    }
  }

}
</script>

<style lang="stylus">
.page-index
  defineColorVar(--brand, #4971ba)

  .tsi-main-menu .tab-main
    defineColorVar(--brand, #2c9cd6)
</style>
