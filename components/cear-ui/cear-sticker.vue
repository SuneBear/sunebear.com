<template lang="pug">
.cear-sticker(
  :class="{ 'custom-width': this.width }"
  :style="rootStyle"
)
  template(
    v-if="sticker"
  )
    cear-sprite.sticker-entity.sticker-sprite(
      v-if="sticker.type === 'sprite'"
      :name="sticker.name"
      :frameName="frameName"
      :initData="{ ...spriteInitData, isFlipX }"
    )
    .sticker-entity.sticker-illustration(
      v-else-if="sticker.type === 'illustration'"
      :class="[ 'illustration-' + sticker.name ]"
      :style="entityStyle"
    )
    .label-content.is-bottom(
      v-if="label"
    ) {{ label }}
</template>

<script>
import { CEAR_SPRITES } from './cear-sprite'
import { random } from '~/utils/random'
import { CEAR_STICKER_OPTIONS_LIST } from '~/assets/stickers'

export const CEAR_STICKERS = []

const DEFAULT_STICKER_OPTIONS = {
  name: null,
  type: 'illustration',
  collection: 'default',
  src: '',
  scale: 0.25,
  // Is't can be replaced by CSS
  labelOptions: null,
  width: 500,
  height: 500
}

function addSticker(stickerOptions = {}) {
  if (!stickerOptions.name) {
    console.warn(`Sticker name is required`, stickerOptions)
    return
  }
  if (!stickerOptions.src) {
    console.warn(`Sticker src is required`, stickerOptions)
    return
  }
  if (CEAR_STICKERS.some(el => el.name === stickerOptions.name)) {
    console.warn(`Duplicated sticker name: ${el.name}`)
    return
  }
  CEAR_STICKERS.push({ ...DEFAULT_STICKER_OPTIONS, ...stickerOptions })
}

// Fill CEAR_SPRITES
CEAR_STICKER_OPTIONS_LIST.map(addSticker)

CEAR_SPRITES.map(sprite => {
  sprite.type = 'sprite'
  addSticker(sprite)
})

export default {

  props: {
    name: {
      type: String
    },
    collection: {
      type: String
      // @values: default | animal | plant | absurd
    },
    type: {
      type: String
      // @values: illustration | sprite
    },
    // @shortcut: Spec frame for spritesheet
    frameName: {
      type: String
    },

    // Content
    label: {
      type: String
    },
    // @TODO: Add cear-message-popover, like a game chat dialog
    message: {
      type: String
    },

    // Style
    width: {
      type: String
    },
    isFlipX: {
      type: Boolean
    },
    // @TODO: Support boundury style
    outline: {
      type: [String, Boolean]
    },
    stroke: {
      type: [String, Boolean]
    },
    shadow: {
      type: [String, Boolean]
    },
    tint: {
      // @TODO: Support tint image
      type: String
    },

    // Sub com
    spriteInitData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
    }
  },

  computed: {
    sticker() {
      let sticker

      if (this.name) {
        sticker = CEAR_STICKERS.find(el => el.name === this.name)
        if (!sticker) {
          console.warn(`Invalid sticker name: ${this.name}`)
        }
      } else if (this.type) {
        const stickers = CEAR_STICKERS
          .filter(el => el.type === this.type)
        if (!stickers.length) {
          console.warn(`Invalid sticker type: ${this.type}`)
        }
        sticker = random.pick(stickers)
      } else if (this.collection) {
        const stickers = CEAR_STICKERS
          .filter(el => el.collection === this.collection)
        if (!stickers.length) {
          console.warn(`Invalid sticker collection: ${this.collection}`)
        }
        sticker = random.pick(stickers)
      }

      return sticker
    },

    rootStyle() {
      const style = {
        width: this.width
      }

      if (!style.width && this.sticker.type !== 'sprite') {
        style.width = `${this.sticker.width * this.sticker.scale}px`
      }

      return style
    },

    entityStyle() {
      const { sticker } = this

      return {
        backgroundImage: `url(${sticker.src})`,
        // @REF: https://web.dev/aspect-ratio/
        // aspectRatio: `${sticker.width} / ${sticker.height}`,
        paddingTop: `${sticker.height / sticker.width * 100}%`,
        transform: `scaleX(${ this.isFlipX ? -1 : 1 })`
      }
    },

    innerLabelStyle() {
      return {}
    }
  }

}
</script>

<style lang="stylus">
.cear-sticker

  &.custom-width
    .sticker-entity
      width: 100% !important

  .sticker-entity
    // background-size: cover
    background-repeat: no-repeat
    background-size: contain
    background-position: center center

  .sticker-illustration
    width: 100%

  .label-content
    null

  .sticker-label
    position: relative
    display: flex
    justify-content: center
    align-items: center
</style>
