<template lang="pug">
.ink-paper(
  :class="rootClass"
)
  slot
</template>

<script>
export default {

  props: {
    name: {
      type: String,
      default: 'dotted'
    }
  },

  computed: {
    rootClass() {
      return [ `background-${this.name}` ]
    }
  }

}
</script>

<style lang="stylus">
.ink-paper
  width: 100%
  min-height: 100%

  &.background-dotted
    background-image:
      radial-gradient(brand(30) 1.3px, transparent 1.3px),
      radial-gradient(brand(30) 1.3px, #f4f3e3 1.3px),
      url(@/assets/ink-ui/patterns/noisy-texture-100x100-o18-d100-c-c4ece8-t1.png)
    background-size: 52px 52px, 52px 52px, auto
    background-position: 0 0, 26px 26px
    background-blend-mode: normal, color-dodge

  &.background-line
    background-image: url(@/assets/ink-ui/patterns/lined-paper-2.png)

</style>
