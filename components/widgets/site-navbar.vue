<template lang="pug">
.site-navbar.d-flex.flex-row.flex-md-column
  nuxt-link.handler( to="/?section=top")
    //- @TODO: Click logo to start a story
    cear-sticker.anim-squiggly.mb-4(
      name="logo-bear"
    )
  .nav-list
    nuxt-link.nav-item.handler( to="/?section=top" exact-path )
      .item-dot
        cear-blob( )
      .el-link.item-text {{ $t('nav.home') }}
    nuxt-link.nav-item.handler( to="/blog?section=top" exact-path )
      .item-dot
        cear-blob( )
      .el-link.item-text {{ $t('nav.blog') }}
    nuxt-link.nav-item.handler( to="/playground?section=top" exact-path )
      .item-dot
        cear-blob( )
      .el-link.item-text {{ $t('nav.playground') }}
    nuxt-link.nav-item.handler( to="/about?section=top" exact-path )
      .item-dot
        cear-blob( )
      .el-link.item-text {{ $t('nav.about') }}
</template>

<script>
export default {

  props: {
    scrollTop: {
      type: Number
    },
    scrollLeft: {
      type: [Number, String]
    },
    isScrolling: {
      type: Boolean
    }
  }

}
</script>

<style lang="stylus">
.site-navbar
  --nav-offset: 22px
  position absolute
  z-index: $zIndexHeader
  font-family: var(--fonts-ui)
  // width: 100%
  padding: 2rem 2.5rem

  &:hover
    --text-opacity: 1
    // --nav-offset: 0

  @media $mediaInMiddleScrren
    position: fixed
    left: 0.5rem
    top: 1rem
    --text-opacity: 0

  .illustration-logo-bear
    // border-radius: 50%
    // border: 3px solid $secondary

  .nav-list
    @media print
      display: none

  .nav-item
    display: flex
    align-items: center
    margin-bottom: 10px
    padding: 0 12px
    transform: translateX(var(--nav-offset))
    transition: 318ms

    .item-dot
      // background-color: primary(90)
      transition: 418ms
      position relative
      width: 20px
      height: 20px
      margin-right: 12px
      border: 1px solid transparent
      border-radius: 3px

      .cear-blob
        --width: 10px
        --background: transparent
        position absolute
        inset: 4px

      .css-blob
        border: 2px solid primary(80)

    .item-text
      transition: 318ms
      opacity: var(--text-opacity)
      color: primary(80)
      // padding: 0 8px
      // border: 1px solid primary(80)
      // border-radius: 3px

    for num in (1..10)
      &:nth-child({num})
        .item-dot,
        .item-text
          // transition-delay: (num * 50ms)

    &:hover
      .item-dot
        border-color: primary(80)
        transition-delay: 0ms !important

      .item-text
        opacity: 1
        color: primary(100)
        text-decoration: none !important

    &.nuxt-link-active
      .item-text
        color: $brand

      .item-dot
        .css-blob
          --background: primary(80)

      &:hover
        .item-dot
          background-color: primary(80)

          .css-blob
            --background: secondary(100)
            border-width: 1px

</style>
