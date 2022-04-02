<template lang="pug">
.tsi-chapter-control(
  :class="{ 'is-show': !$tsi.isShowMainMenu }"
)
  transition( name="el-fade-in" )
    .handler-wrapper(
      v-if="$tsi.currentChapter === 'main' && $tsi.currentActionMode === 'viewSpark'"
    )
      cear-button(
        isBlock
        type="secondary-ghost"
        icon="arrow-go-back-fill"
        shadow="black"
        @click="$tsi.currentActionMode = 'swim'"
      ) {{ $t('action.exit') }}

  transition( name="el-fade-in" )
    .handler-wrapper(
      v-if="$tsi.currentChapter !== 'main' && !$tsi.isSwitchingChapter"
    )
      cear-button(
        isBlock
        type="secondary-ghost"
        icon="arrow-go-back-fill"
        shadow="black"
        @click="$tsi.currentChapter = 'main'"
      ) {{ $t('action.exit') }}
</template>

<script>
export default {}
</script>

<style lang="stylus">
.tsi-chapter-control
  position absolute
  z-index: 2
  left: 2rem
  top: 2rem
  transform: scale(0.8)
  opacity: 0
  transition: 418ms

  &.is-show
    transform: scale(1)
    opacity: 1

  .cear-button
    opacity: 0.8
    pointer-events: initial
</style>
