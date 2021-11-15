<template lang="pug">
.ink-button(
  :class="rootClass"
  :style="rootStyle"
)
  //- @TODO: Add some cuter buttons
  .other-type(
    v-if="type === 'another-type'"
  )
  .el-button-wrapper(
    v-else
  )
    ink-mask(
      v-bind="$props"
      :baseFrequency="finalBaseFrequency"
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
    baseFrequency: {
      type: [ Number, String ],
    },
    size: {
      type: String,
      default: 'medium'
    },
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
        { 'is-disabled': this.disabled, 'is-block': this.isBlock, 'has-shadow': this.finalShadow },
        { 'anim-vert-shake': this.vertShake, 'anim-vert-shake-hover': this.vertShakeHover },
        { 'anim-squiggly': this.squiggly, 'anim-squiggly-hover': this.squigglyHover },
      ]
    },
    rootStyle() {
      return {
        '--shadow': this.finalShadow
      }
    },
    finalShadow() {
      if (typeof this.shadow === 'undefined') {
        return this.getDefaultShadowByType()
      }

      return this.shadow
    },
    finalBaseFrequency() {
      if (typeof this.baseFrequency === 'undefined') {
        return '0.05'
      }

      return this.baseFrequency
    }
  },

  methods: {
    handleButtonClick(e) {
      this.$emit('click', e)
    },

    getDefaultShadowByType() {
      if (!this.type || this.type === 'default') {
        return 'rgba(var(--primary-rgb), 0.15)'
      }

      if (this.type === 'secondary-outline' || this.type === 'gray') {
        return 'hsl(var(--secondary-h), var(--secondary-s), 82%)'
      }

      if (this.type.includes('primary')) {
        return 'rgba(var(--secondary-rgb), 0.7)'
      }

      if (this.type === 'primary') {
        return 'var(--secondary)'
      }

      if (this.type === 'brand-light') {
        return 'hsl(var(--brand-h), var(--brand-s), 85%)'
      }

      if (this.type === 'brand') {
        return 'hsl(var(--brand-h), var(--brand-s), 98%)'
      }
    }
  }

}
</script>

<style lang="stylus">
.ink-button
  padding-right: 6px
  padding-bottom: 6px

  // Case: Shadow
  &.has-shadow
    .el-button-wrapper
      transition: 118ms

    .front-layer:not(.is-circle)
      margin-left: -1px
      padding-bottom: 4px !important

      &.el-button--small
        padding-bottom: 7px !important

    .back-layer
      filter: drop-shadow(1px 4px 0 var(--shadow))
      margin-right: 4px
      margin-bottom: 4px

    &:not(.is-disabled):active
      .el-button-wrapper
        transform: translateY(3px)

      .back-layer
        filter: drop-shadow(0 0 0 var(--shadow))

  // Case: Block
  &.is-block
    width: 100%
    // max-width: 400px

    .back-layer
      display: flex
      width: 100%

   // Case: Round & Circle
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

      &[class*="-outline"],
      &[class*="-light"]
        padding: 0.05em 0.7em

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
