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

  template( v-if="name === 'branch-wreath'" )
    cear-sticker( width="4em" name="branch" )
    .label-text
      slot
    cear-sticker( width="4em" name="branch" isFlipX)

  template( v-else-if="name === 'divider-sticker'" )
    cear-sticker( v-bind="stickerOptions" :label="finalText" )

  template( v-else-if="name.startsWith('divider-line')" )
    .label-text( v-if="$slots.default" )
      slot

  template( v-else-if="name.startsWith('washi-tape')" )
    cear-paper( :name="theme" :class="{ 'has-text': $slots.default }" )
      slot

  template( v-else-if="name === 'double-color'" )
    .label-text
      span( v-for="char in finalText" ) {{ char }}

  template( v-else-if="name === 'ribbon' || name === 'banner-double-layer'" )
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

          // Finished
          'divider-sticker', // @TODO: Colorful mono-tone divider stickers
          'divider-line-solid',
          'divider-line-dashed',
          'divider-line-dotted',
          'washi-tape-diamond',
          'washi-tape-arrow',
          'washi-tape-sheer',
          'washi-tape-zigzag',
          'banner-double-layer',
          'branch-wreath',
          'laurel-wreath',
          'double-color',
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

    stickerOptions: {
      type: Object
    },

    onClick: {
      type: Function,
      // default: () => {}
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
    },
    finalText() {
      return this.text || (this.$slots.default && this.$slots.default[0].text)
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
  --banner-border-radius: 0 0 125px 3px/3px 85px 5px 55px

  --hover-icon-color: $green

  .label-text
    font-size: 1.4em

  .cear-sticker
    position relative
    max-width: s('min(100%, 70vw)')

    .label-content
      position absolute
      width: 100%
      top: 50%
      transform: translateY(-100%)
      font-size: 1.2em
      text-align: center

  &.align-center
    margin-left: auto
    margin-right: auto
    display: flex
    justify-content: center
    min-width: 0

  &[class*="name-divider-line-"],
  &.name-divider-sticker
    margin-top: var(--divider-margin)
    margin-bottom: var(--divider-margin)

  &[class*="name-divider-line-"]
    display: flex
    align-items: center
    color: primary(80)

    &.is-empty
      width: var(--divider-empty-width, 14%)

      &:after
        display: none

    > .label-text
      padding: 0 1em

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
      padding: 0 0.2em
      font-size: 2em

      &.has-text
        background-clip: text
        color: transparent
        font-weight: bold
        text-shadow: 0 0 primary(30)

  &.name-washi-tape-sheer
    border-radius: 15px 4px 20% 5px / 4px 8px 5px 15px

  // @REF: https://bennettfeely.com/clippy/
  &.name-washi-tape-arrow
    // @TODO: Should beautify
    // clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)
    clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)

  &.name-washi-tape-zigzag
    // @REF: https://github.com/XboxYan/coupon
    --radius-size: 4px
    --radius-spacing: 8px
    -webkit-mask-image: radial-gradient(circle at var(--radius-size), transparent var(--radius-size), red calc(var(--radius-size) + 0.5px))
    -webkit-mask-position: calc(var(--radius-size) * -1)
    -webkit-mask-size: 100% var(--radius-spacing)

  &.name-washi-tape-diamond
    clip-path: polygon(1.5em 0%, calc(100% - 1.5em) 0%, 100% 50%, calc(100% - 1.5em) 100%, 1.5em 100%, 0% 50%)

  &.name-branch-wreath
    opacity: 0.7
    transition 0.3s

    .label-text
      font-size: 1.6em
      padding: 0 1em
      // padding-bottom: 0.8em
      // margin: 0 -0.5em

    &.handler:hover
      opacity: 1

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

  &.name-banner-double-layer
    position: relative
    padding: var(--banner-vert-padding, 1em) 4em
    border: 1.5px solid primary(20)
    border-radius: var(--banner-border-radius)
    background: #f7afb4
    text-align: center
    box-shadow: 5px 4px 0 0 #fff, 4px 6px 0 0 primary(20), 6.5px 5.5px 0 0 primary(20), 6.5px 2.5px 0 0 primary(20)

    .label-text
      font-size: 2em
      font-weight: bold

  &.name-double-color
    .label-text
      font-size: 4em
      letter-spacing: 1px
      font-weight: bold

    span
      -webkit-text-stroke: 0.04em primary(25)
      display: inline-block
      white-space: break-spaces

      &:nth-child(odd)
        color: var(--color-odd, rgba(253, 200, 48, 0.6))

      &:nth-child(even)
        color: var(--color-even, rgba(205, 220, 57, 0.7))

      &:nth-child(2n)
        transform: rotate(4deg)

      &:nth-child(3n)
        transform: rotate(-6deg)

      &:nth-child(4n)
        transform: rotate(-3deg)

      &:nth-child(5n)
        transform: rotate(6deg)

</style>
