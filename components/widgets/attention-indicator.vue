<template lang="pug">
.attention-indicator(
  :class="[{ 'handler': onClick }, `animation-${animation}` ]"
  @click="handleRootClick"
)
  cear-blob.indicator-instance.type-blob-icon(
    v-if="type === 'blob-icon'"
    width="48px"
    background="transparent"
  )
    cear-icon(
      circle
      size="24px"
      fill="var(--front-color)"
      :enableDistort="false"
      :name="icon"
    )

</template>

<script>
export default {

  props: {
    type: {
      type: String,
      default: 'blob-icon'
    },

    animation: {
      type: String,
      default: 'shake-hand'
    },

    icon: {
      type: String,
      default: 'hand-left-fill'
    },

    onClick: {
      type: Function
    },
  },

  methods: {
    handleRootClick(event) {
      if (this.onClick) {
        this.onClick(event)
      }
    }
  }

}
</script>

<style lang="stylus">
.attention-indicator
  display: inline-block

  --ease-out-swift: cubic-bezier(.55, 0, .1, 1)
  --front-color: $brand
  --bg-before-color: $secondary
  --bg-after-color: $brand

  @keyframes shake-hand
    0%
      transform: rotate(-5deg)

    25%
      transform: rotate(15deg)

    50%
      transform: rotate(-10deg)

    75%
      transform: rotate(15deg)

    100%
      transform: rotate(-5deg)

  &.animation-shake-hand
    .cear-icon
      transform-origin: bottom center
      animation: shake-hand 2s infinite

  .indicator-instance
    null

  .type-blob-icon
    display: inline-block

    .blob
      &:before,
      &:after
        position: absolute
        z-index: -1
        width: 100%
        height: 100%
        background: var(--bg-before-color)
        border-radius: 50%
        transition: transform .4s var(--ease-out-swift)
        content: ""

      &:after
        background: var(--bg-after-color)
        transform: scale(0)

    .svg-symbol
      margin-top: 6px
      transition: fill .15s var(--ease-out-swift), transform .15s var(--ease-out-swift)

  &.handler
    &:hover
      --front-color: $secondary
      .blob
        &:before
          transform: scale(0)

        &:after
          transform: scale(1)

    &:active
      .blob
        &:before
          transform: scale(0)

        &:after
          transform: scale(.95)
          transition-duration: 0s
</style>
