<template lang="pug">
cear-photo-frame.figure-image(
  :strokeWidth="strokeWidth"
  :class="{ 'handler': href }"
  :style="{ maxWidth: width }"
  @click.native="handleRootClick"
)
  img(
    :alt="caption"
    :style="{ '--ratio': ratio  }"
    :src="src"
  )
  caption( v-if="caption" ) {{ caption }}
</template>

<script>
export default {

  props: {
    strokeWidth: {
      type: String,
      default: '4px'
    },
    href: {
      type: String
    },
    src: {
      type: String,
      required: true
    },
    caption: {
      type: String
    },
    width: {
      type: String
    },
    ratio: {
      type: String
    }
  },

  methods: {
    handleRootClick () {
      if (!this.href) {
        return
      }

      if (this.href.includes(location.host)) {
        return location.href = this.href
      }

      if (this.href) {
        return window.open(this.href, "_blank")
      }
    }
  }

}
</script>

<style lang="stylus">
.cear-photo-frame.figure-image
  display: inline-block

  .mask-wrapper
    border: none

  img
    aspect-ratio: var(--ratio, inherit)
    object-fit: cover
    vertical-align: middle
    width: 100%
    margin: 0

  caption
    display block
    padding: 6px 12px 10px
    font-size: 0.75em
    text-align: left
</style>
