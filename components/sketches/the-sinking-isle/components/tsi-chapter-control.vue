<template lang="pug">
.tsi-chapter-control
  transition( name="el-fade-in" )
    .handler(
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
  left: 2rem
  top: 2rem

  .cear-button
    opacity: 0.8
    pointer-events: initial
</style>
