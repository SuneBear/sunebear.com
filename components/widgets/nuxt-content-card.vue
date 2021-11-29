<template lang="pug">
.nuxt-content-card( :class="{ 'is-in-list': isInList }" )
  component.handler( :is="onTitleClick ? 'div' : 'nuxt-link'" :to="content.path"  @click="handleTitleClick" )
    h1.content-title.mb-2.mb-md-4
      cear-notation( isShow isHalfHighlight :animate="false" ) {{ content.title }}

  .content-meta.mb-4.mb-md-8
    | {{ $t('content.meta', { date: formattedData, author: this.author }) }}

  readable-render(
    type="nuxtContent"
    :content="{ body: isInList && content.except ? content.except : content.body }"
  )
</template>

<script>
import { getFormattedData } from '~/utils/time'

export default {

  props: {
    content: {
      type: Object,
      required: true
    },

    onTitleClick: {
      type: Function
    },

    isInList: {
      type: Boolean
    }
  },

  computed: {
    formattedData() {
      return getFormattedData(this.content.date || this.content.createdAt)
    },

    author() {
      return 'SuneBear'
    }
  },

  methods: {
    handleTitleClick () {
      this.onTitleClick && this.onTitleClick()
    }
  },

}
</script>

<style lang="stylus">
.nuxt-content-card

  &.is-in-list
    .nuxt-content
      display: -webkit-box
      -webkit-box-orient: vertical
      -webkit-line-clamp: 8
      overflow: hidden

  & + &
    margin-top: 48px

  .content-title
    // @FIXME: Replace Menlo font, support weight 500
    // font-family: var(--fonts-title)
    font-weight: 400
    position relative

    @media $mediaInMobile
      font-size: 24px

  .content-meta
    color: primary(60)

  .nuxt-content
    font-size: 18px

  .content-meta,
  .nuxt-content

    @media $mediaInMobile
      font-size: 14px

</style>
