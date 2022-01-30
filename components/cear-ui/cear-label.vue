<template lang="pug">
.cear-label(
  :class="rootClass"
  :style="rootStyle"
  @click="handleRootClick"
)

  template( v-if="name === 'laurel-wreath'" )
    cear-icon( name="laurel-wreath-left" )
    .label-text
      slot
    cear-icon( name="laurel-wreath-left" isFlipX )

  template( v-else-if="name.startsWith('divider-line')" )
    .label-text( v-if="$slots.default" )
      slot

  template( v-else-if="name.startsWith('washi-tape')" )
    cear-paper( :name="theme" :class="{ 'has-text': $slots.default }" )
      slot

  template( v-else-if="name === 'ribbon'" )
    .label-text
      slot
</template>

<script>
export default {

  props: {

    name: {
      type: String,
      validator: (val) => {
        return [
          // @TODO
          'ribbon-banner',
          'ribbon-bookmark',
          'ribbon-corner',
          'mbe-galaxy',
          'animal-banner',
          'pastel-highlight',
          'divider-leaves',
          'divider-scribble',

          // Finished
          'divider-line-solid',
          'divider-line-dashed',
          'divider-line-dotted',
          'washi-tape-diamond',
          'washi-tape-arrow',
          'washi-tape-sheer',
          'washi-tape-zigzag',
          'laurel-wreath'
        ].includes(val)
      },
      default: 'ribbon-banner'
    },

    unitSize: {
      type: String,
      default: '10px'
    },

    text: {
      type: String
    },

    title: {
      type: String
    },

    icon: {
      type: String
    },

    theme: {
      type: String
    },

    status: {
      type: String
    },

    align: {
      type: String
    },

    onClick: {
      type: Function,
      default: () => {}
    }

  },

  computed: {
    rootClass() {
      return [
        `name-${this.name}`,
        this.status && `status-${this.status}`,
        this.align && `align-${this.align}`,
        (!this.$slots.default && !this.text) && 'is-empty',
        { 'handler': this.onClick }
      ]
    },
    rootStyle() {
      return {
        fontSize: this.unitSize
      }
    }
  },

  methods: {
    handleRootClick(event) {
      if (this.onClick) {
        this.onClick()
      }
    }
  },

}
</script>

<style lang="stylus">
.cear-label
  display: inline-flex
  align-items: center
  line-height: 1.2

  --divider-margin: 3em
  --washi-tape-height: 3em
  --washi-tape-width: 10em

  --hover-icon-color: $green

  .label-text
    font-size: 1.4em

  &.align-center
    margin-left: auto
    margin-right: auto

  &[class*="name-divider-line-"]
    display: flex
    align-items: center
    margin-top: var(--divider-margin)
    margin-bottom: var(--divider-margin)
    color: primary(80)

    &.is-empty
      width: var(--divider-empty-width, 14%)

      &:after
        display: none

    .label-text
      padding: 0 0.5em

    &:before,
    &:after
      content: ''
      height: 0px
      border-bottom: var(--divider-height, 3px) var(--divider-line-style, solid) var(--divider-color, currentColor)
      opacity: var(--divider-opacity, 0.14)
      flex-grow: 1

  &.name-divider-line-dashed
    --divider-line-style: dashed
    --divider-height: 2px

  &.name-divider-line-dotted
    --divider-line-style: dotted

  &[class*="name-washi-tape-"]
    min-width: var(--washi-tape-width)
    height: var(--washi-tape-height)
    letter-spacing: 0.05em

    &.is-empty
      box-shadow: 0 1px 4px primary(10)

    .cear-paper
      display: block
      line-height: var(--washi-tape-height)
      padding: 0 1em
      font-size: 1.8em

      &.has-text
        background-clip: text
        color: transparent
        font-weight: bold
        text-shadow: 0 0 primary(30)

  &.name-washi-tape-sheer
    border-radius: 15px 4px 20% 5px / 4px 8px 5px 15px

  &.name-washi-tape-arrow
    // @TODO: Should beautify
    clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)

  &.name-washi-tape-zigzag
    // @REF: https://github.com/XboxYan/coupon
    --radius-size: 4px
    --radius-spacing: 8px
    -webkit-mask-image: radial-gradient(circle at var(--radius-size), transparent var(--radius-size), red calc(var(--radius-size) + 0.5px))
    -webkit-mask-position: calc(var(--radius-size) * -1)
    -webkit-mask-size: 100% var(--radius-spacing)

  &.name-washi-tape-diamond
    clip-path: polygon(1.5em 0%, calc(100% - 1.5em) 0%, 100% 50%, calc(100% - 1.5em) 100%, 1.5em 100%, 0% 50%)

  &.name-laurel-wreath
    opacity: 0.4
    transition 0.3s

    .label-text
      font-size: 1.6em

    .cear-icon
      font-size: 5em
      opacity: 0.7
      transition 0.3s

    &.handler:hover,
    &.status-active
      opacity: 1

      .cear-icon
        color: var(--hover-icon-color)
        transform: scale(1.1)  translate(.1em, 0)

        &.is-flip-x
          transform: scale(1.1) translate(-.1em, 0)
</style>
