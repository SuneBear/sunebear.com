<template lang="pug">
.page.page-icons(
)
  icons-list(
    v-if="!isLoading"
    :onClick="handleIconClick"
  )
</template>

<script>
import IconsList from '@nuxtjs/svg-sprite/lib/pages/icons-list.vue'

export default {

  head() {
    return {
      title: 'Icons'
    }
  },

  components: {
    IconsList
  },

  data() {
    return {
      isLoading: true
    }
  },

  mounted() {
    setTimeout(() => {
      this.isLoading = false
    }, 200)
  },

  methods: {
    handleIconClick(message) {
      this.$message.info({ message })
    }
  }

}
</script>

<style lang="stylus">
.page-icons
  ._icon-sprite-title
    margin-bottom: 20px

  ._icon-search
    border-width: 3px
    border-radius: 15px / 20px
    margin-bottom: 30px
    transition: border 300ms
    appearance none
    outline none

    &:focus
      border-color: var(--brand)

  ._icon-preview
    height: auto !important

  ._icon-name-input
    cursor pointer !important

  ._icon-name
    font-size: 12px !important
    margin-top: 20px !important
    padding: 5px 12px !important
    background: brand(20) !important
    text-overflow()

  ._icon-card
    padding: 40px 20px 30px !important
    background: brand(0) !important
    border-radius: 10px / 15px !important
    transition: background 400ms, fill 400ms, box-shadow 400ms

    &:hover
      background: secondary(90) !important
      fill: $brand !important
      --fill: $brand
      box-shadow: 4px 4px 20px brand(50) !important

</style>
