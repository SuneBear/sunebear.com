<template lang="pug">
.cear-button(
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
    cear-mask(
      v-bind="maskProps"
      :baseFrequency="finalBaseFrequency"
    )
      el-button.back-layer(
        v-bind="elButtonProps"
        @click="handleButtonClick"
      )
        .d-flex.align-center
          .cear-icon(
            v-if="icon"
          )
            .svg-symbol
          slot
    el-button.front-layer(
      v-bind="elButtonProps"
    )
      .d-flex.align-center.justify-center
        cear-icon( v-if="icon" :shadow="iconShadow" :name="icon" )
        slot
</template>

<script>
import { Button } from 'element-ui'
import InkMask from './cear-mask'

export default {

  props: {
    ...Button.props,
    ...InkMask.props,
    maskId: {
      type: [Number, String],
      default: 'button'
    },
    baseFrequency: {
      type: [ Number, String ],
    },
    isSquare: {
      type: Boolean
    },
    size: {
      type: String,
      default: 'medium'
    },
    border: {
      type: String
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
        { 'is-disabled': this.disabled, 'is-square': this.isSquare, 'is-block': this.isBlock, 'has-shadow': this.finalShadow },
        { 'anim-vert-shake': this.vertShake, 'anim-vert-shake-hover': this.vertShakeHover },
        { 'anim-squiggly': this.squiggly, 'anim-squiggly-hover': this.squigglyHover },
      ]
    },
    rootStyle() {
      const style = {
        '--shadow': this.finalShadow,
      }
      if (this.border) {
        style['--border-color'] = this.border
      }
      return style
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
    },

    maskProps() {
      return Object.keys(InkMask.props).reduce((acc, key) => {
        acc[key] = this[key]
        return acc
      }, {})
    },

    elButtonProps() {
      return Object.keys(Button.props).reduce((acc, key) => {
        acc[key] = this[key]
        return acc
      }, {})
    }
  },

  methods: {
    handleButtonClick(e) {
      this.$emit('click', e)
    },

    getDefaultShadowByType() {
      if (!this.type || this.type === 'default' || this.type === 'secondary-ghost') {
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
.cear-button
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

    .front-layer.is-circle,
    .front-layer.is-round
      margin-top: -3px
      margin-left: -1px

    .back-layer
      filter: drop-shadow(1px 4px 0 var(--shadow))
      margin-right: 4px
      margin-bottom: 6px

      &[class*="-ghost"]
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

  // Case: Square
  &.is-square
    .el-button
      border-radius: 0 !important

   // Case: Round & Circle
  .el-button
    &.is-circle,
    &.is-round

      .cear-icon
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

      .cear-icon
        font-size: 1.6em

  .el-button-wrapper
    position: relative

    .cear-icon
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
