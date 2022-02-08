<template lang="pug">
page-wrapper(
  name="stickers"
)
  .container.is-responsive(
    v-loading="!collections.length"
  )
    .d-flex.justify-center
      cear-label.mb-8( name="banner-double-layer" )
        .d-flex.align-center
          cear-icon.mr-4( name="galaxy-spark-tones" size="1.5em" )
          | Stickers
          cear-icon.ml-4( name="star-with-dots-tones" size="1.5em" )

    .section.mb-4(
      v-for="collection in collections"
      :class="[ `section-${collection.name}` ]"
    )
      cear-label( name="divider-line-dashed" style="--divider-color: #d17500; --divider-opacity: 0.3" )
        cear-label( name="double-color" unitSize="6px" ) {{ collection.name }}

      .d-flex.flex-wrap.justify-center.sticker-list
        .sticker-card.handler(
          v-for="sticker in collection.stickers"
          @click="handleCopyNameClick(sticker.name)"
        )
          cear-sticker(
            :name="sticker.name" :label="sticker.name"
            :spriteInitData="{ isShowFrameName: !sticker.isPlayable }"
          )

</template>

<script>
import { copyToClipboard } from '~/utils/copy'
import { CEAR_STICKERS } from '~/components/cear-ui/cear-sticker.vue'

export default {

  head() {
    return {
      title: 'Stickers'
    }
  },

  data() {
    return {
      paperName: 'grid-dashed-lines',
      collections: []
    }
  },

  created() {
    this.collections = this.generateCollections()
  },

  methods: {
    generateCollections() {
      const collections = []
      const priorityTable = {
        default: 999,
        animals: 990,
        'still-lifes': 980
      }

      CEAR_STICKERS.map(el => {
        let current = collections.find(col => col.name === el.collection)

        if (!current) {
          current = {
            name: el.collection,
            priority: priorityTable[el.collection] || 0,
            stickers: []
          }
          collections.push(current)
        }

        current.stickers.push(el)
      })

      collections.sort((a, b) => {
        if (a.priority || b.priority) {
          return b.priority - a.priority
        }
        if (a.name > b.name) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        return 0
      })

      return collections
    },

    handleCopyNameClick(name) {
      copyToClipboard(name)
      this.$message.info({ message: `Sticker "${name}" copied to clipboard` })
    }
  }

}
</script>

<style lang="stylus">
.page-stickers
  null

  .sticker-list
    gap: max(1vw, 12px)

    .sticker-card
      display: flex
      flex-direction: column
      justify-content: flex-end
      padding: 40px 30px 30px !important
      background: brand(0) !important
      border-radius: 15px !important
      transition: background 400ms, box-shadow 400ms

      &:hover
        background: secondary(90) !important
        box-shadow: 4px 4px 20px brand(50) !important

    .cear-sticker
      display: flex
      flex-direction: column
      align-items: center
      min-width: 80px !important

      .label-content
        font-size: 12px
        margin-top: 20px
        padding: 5px 12px
        background: brand(20)
        border-radius: 3px
        text-overflow()
        max-width: 100%

    .cear-sprite
      display: flex
      flex-direction: column
      align-items: center

      .sprite-entity
        width: 100%

      .frame-name
        font-size: 0.7em
        white-space: pre
        margin-top: 2em
        margin-bottom: -1em
        opacity: 0.7

        &:before
          content: 'Frame: '

</style>
