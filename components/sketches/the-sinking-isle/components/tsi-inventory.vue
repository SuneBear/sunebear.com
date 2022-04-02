<template lang="pug">
.tsi-inventory
  .inventory-toolbar(
    :class="{ 'is-show': !$tsi.isShowMainMenu }"
  )
    transition( name="el-fade-in" )
      .d-flex.view-spark-toolbar(
        v-if="$tsi.currentActionMode === 'viewSpark'"
      )
        .toolbar-item
        .toolbar-item
        tsi-wish-input(
          @confirm="handleConfirm"
        )
</template>

<script>
export default {

  methods: {

    handleConfirm (text) {
      if (!this.$tsi.cachedContext.sparkWishBeaconLightTime) {
        this.$tsi.cachedContext.sparkWishBeaconLightTime = Date.now()
        this.$tsi.$story.add({
          user: 'user',
          message: this.$t('tsi.wishInput.storyMessage', { text }),
          text,
          tag: 'sparkWishBeaconLightTime',
          silent: true
        })
        this.$tsi.$story.add({
          user: 'bear',
          message: this.$t('tsi.wishInput.storyMessageBearReply'),
          silent: true
        })
      }
      this.$tsi.$emit('sparkWishConfirm', text)
    }

  }

}
</script>

<style lang="stylus">
.tsi-inventory

  .inventory-toolbar
    position absolute
    width: 100%
    display: flex
    justify-content: center
    align-items: center
    height: 40px
    bottom: calc(2rem + env(safe-area-inset-bottom))
    transform: translateY(300%)
    transition: transform 418ms

    &.is-show
      transform: translateY(0)

    > *
      pointer-events: initial

  .toolbar-item
    display: none
    width: 40px
    height: 40px
    border: 1px dashed $secondary
    background: secondary(20)
    opacity: 0.8
    box-shadow: 3px 2px 0px primary(65)

    & + .toolbar-item
      margin-left: 12px

  .view-spark-toolbar
    .tsi-wish-input
      opacity: 0.8

</style>
