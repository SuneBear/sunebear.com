<template lang="pug">
.page.page-index(
)
  the-sinking-isle
</template>

<script>
export default {

  head() {
    return {
      title: this.$t('tsi.sketch.title')
    }
  }

}
</script>

<style lang="stylus">
.page-index
  background: $secondary
</style>
