<template lang="pug">
.nuxt-content-card( :class="{ 'is-in-list': isInList }" )
  component.handler( :is="onTitleClick ? 'div' : 'nuxt-link'" :to="content.path"  @click="handleTitleClick" )
    h1.content-title.mb-2.mb-md-4
      cear-notation( isShow isHalfHighlight ) {{ content.title }}

  .content-meta.mb-4.mb-md-8
    | {{ $t('content.meta', { date: formattedDate, author: this.author }) }}

  readable-render(
    type="nuxtContent"
    :content="{ body: isInList && content.except ? content.except : content.body }"
  )
</template>

<script>
import { getFormattedDate } from '~/utils/time'

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
    formattedDate() {
      return getFormattedDate(this.content.date || this.content.createdAt)
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
.nuxt-content-card,
.readable-content-card
  font-family: var(--fonts-blog)
  font-size: 18px

  &.is-in-list
    .nuxt-content
      display: -webkit-box
      -webkit-box-orient: vertical
      -webkit-line-clamp: 8
      overflow: hidden
      max-height: 280px

      @media $mediaInMobile
        max-height: 220px

  & + &
    margin-top: 48px

  .content-title
    // font-family: var(--fonts-title)
    font-weight: 400
    position relative

    @media $mediaInMobile
      font-size: 24px

  .content-meta
    color: primary(60)

  .nuxt-content
    font-size: 18px

  &,
  .content-meta,
  .nuxt-content

    @media $mediaInMobile
      font-size: 14px

</style>
