<template lang="pug">
.ink-button(
  :class="rootClass"
  :style="rootStyle"
)
  .el-button-wrapper
    ink-mask(
      v-bind="$props"
    )
      el-button.back-layer(
        v-bind="$props"
        @click="handleButtonClick"
      )
        .d-flex.align-center
          .ink-icon(
            v-if="icon"
          )
            .svg-symbol
          slot
    el-button.front-layer(
      v-bind="$props"
    )
      .d-flex.align-center.justify-center
        ink-icon( v-if="icon" :shadow="iconShadow" :name="icon" )
        slot
</template>

<script>
import { Button } from 'element-ui'
import InkMask from './ink-mask'

export default {

  props: {
    ...Button.props,
    ...InkMask.props,
    shadow: {
      type: String
    },
    iconShadow: {
      type: String
    }
  },

  computed: {
    rootClass() {
      return [
        { 'is-disabled': this.disabled, 'is-block': this.isBlock, 'has-shadow': this.shadow },
        { 'anim-vert-shake': this.vertShake, 'anim-vert-shake-hover': this.vertShakeHover },
        { 'anim-squiggly': this.squiggly, 'anim-squiggly-hover': this.squigglyHover },
      ]
    },
    rootStyle() {
      return {
        '--shadow': this.shadow
      }
    }
  },

  methods: {
    handleButtonClick(e) {
      this.$emit('click', e)
    }
  }

}
</script>

<style lang="stylus">
.ink-button
  padding-right: 6px
  padding-bottom: 6px

  &.has-shadow
    transition: 218ms

    .back-layer
      filter: drop-shadow(3px 3px 0 var(--shadow))
      margin-right: 3px
      margin-bottom: 3px

    &:not(.is-disabled):active
      transform: translateY(3px)

      .back-layer
        filter: drop-shadow(0 0 0 var(--shadow))

  &.is-block
    width: 100%

    .back-layer
      display: flex
      width: 100%

  .el-button
    &.is-circle,
    &.is-round

      .ink-icon
        font-size: 1.5em
        margin: 0

    &.is-circle
      border-radius: 50% !important

    &.is-round
      padding: 0.05em 0.6em
      border-radius: 30% !important

      .ink-icon
        font-size: 1.6em

  .el-button-wrapper
    position: relative

    .ink-icon
      font-size: 1.2em
      margin-bottom: 0
      margin-right: 10px
      margin-left: 4px

    .back-layer
      > *,
      .d-flex
        opacity: 0

    .front-layer
      position: absolute
      top: 50%
      margin-left: 0
      background: none !important
      border-width: 0 !important
      left: 50%
      pointer-events: none
      transform: translate3d(-50%, -50%, 0)

      &:before,
      &:after,
      > i
        display: none

</style>
