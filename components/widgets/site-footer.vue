<template lang="pug">
.site-footer.d-flex.justify-space-between
  .left-part
  .middle-part
  .right-part
    .site-name.nametype {{ $t('site.name') }}
</template>

<script>
export default {

}
</script>

<style lang="stylus">
.site-footer
  position relative
  width: 100%
  padding: 2rem 2.5rem
  height: var(--footer-height)
  margin-top: s('calc(var(--footer-height) * -1)')

  .nametype
    padding-top: 2rem
    font-size: 16px
    line-height: 1
    writing-mode: tb-rl

    @media $mediaInMiddleScrren
      position: fixed
      bottom: 4rem
      right: 3rem
</style>
