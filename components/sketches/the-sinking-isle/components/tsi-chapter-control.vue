<template lang="pug">
.tsi-chapter-control
  transition( name="el-fade-in" )
    cear-button(
      v-if="$parent.currentChapter !== 'main' && !$parent.isSwitchingChapter"
      isBlock
      type="secondary-ghost"
      icon="arrow-go-back-fill"
      shadow="black"
      @click="$parent.currentChapter = 'main'"
    ) {{ $t('action.exit') }}
</template>

<style lang="stylus">
.tsi-chapter-control
  position absolute
  left: 2rem
  top: 2rem

  > *
    opacity: 0.8
    pointer-events: initial
</style>
