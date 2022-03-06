<template lang="pug">
.tsi-wish-input(
  :class="{ 'has-value': inputValue }"
)
  cear-mask( :enableDistort="false" )
    cear-sticker.input-icon(
      width="20px"
      name="fireworks-party-colorful"
    )
    el-input(
      :placeholder="$t('tsi.wishInput.placeholder')"
      :disabled="hasConfirmed"
      v-model="inputValue"
      :maxlength="maxlength"
      @keydown.stop.native="() => {}"
      @keydown.enter.native="handleConfirm"
    )
    .input-submit.handler(
      :class="{ 'has-confirmed': hasConfirmed }"
      @click="handleConfirm"
    )
      .item-check(v-if="hasConfirmed")
        svg.check-icon(viewBox='0 0 100 100')
          path(d='M 10 50 L 40 86 L 90 10')
      .item-text(v-else) {{ $t('tsi.wishInput.confirmText') }}

</template>

<script>
import { sleep } from '../engine/utils/async'

// @TODO: Cearify input UI
// @TODO: Polish button hover effect
// @TODO: Polish confirmed sparkle/light effect
export default {

  props: {
    // @TODO: Support hold ux
    holdDuration: {
      type: Number,
      default: 4000
    },
    cooldownDuration: {
      type: Number,
      default: 2000
    },
    maxlength: {
      type: Number,
      default: 16
    }
  },

  data() {
    return {
      inputValue: null,
      holdProgress: 0,
      isHolding: false,
      hasConfirmed: false
    }
  },

  methods: {
    async handleConfirm () {
      if (this.hasConfirmed || !this.inputValue) {
        return
      }

      this.hasConfirmed = true
      this.$emit('confirm', this.inputValue)

      await sleep(this.cooldownDuration)
      this.inputValue = null
      await sleep(500)
      this.hasConfirmed = false
    }
  }

}
</script>

<style lang="stylus">
.tsi-wish-input
  position relative
  filter: drop-shadow(2px 3px 1px primary(20))

  .input-icon
    position absolute
    z-index: 2
    left: 12px
    top: 10px
    pointer-events: none

  .el-input__inner
    // border-radius: 20px
    border-radius: 12px 17px/5px 20px
    border-width: 0
    padding-left: 40px
    padding-right: 54px
    line-height: 24px
    background-color: brand(40) !important
    color: $secondary
    transition: 400ms

    &:disabled
      cursor: default !important

    &::selection
      background-color: alpha($mark, 40%)

  .input-submit
    position absolute
    z-index: 2
    right: 8px
    top: 6px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 10px 15px/12px 17px
    font-size: 12px
    background: transparent
    color: $secondary
    font-weight: bold
    height: 28px
    line-height: 28px
    min-width: 48px
    text-align: center
    transition: 400ms
    opacity: 0
    pointer-events: none
    transform: skewX(0deg) skewY(-2deg)

    .item-check
      @keyframes stroke-dashoffset
        to
          stroke-dashoffset: 0

      .check-icon
        display: block
        width: 18px

        path
          stroke: $green
          stroke-width: 12px
          stroke-dasharray: 140
          stroke-dashoffset: @stroke-dasharray
          stroke-linecap: round
          stroke-linejoin: round
          fill: none
          animation: stroke-dashoffset 0.3s ease-in both

  &.has-value .el-input__inner,
  .el-input__inner:focus
    background-color: brand(70) !important

  &.has-value
    .input-submit
      opacity: 1

      &:not(.has-confirmed)
        pointer-events: initial

        &:hover
          background: brandLightness(60)

</style>
