<template lang="pug">
.memoir-chart
</template>

<script>
import DEFAULT_MEMOIR_DATA from '~/content/memoir/memoir-data.yml'

export default {

  props: {
    view: {
      type: String,
      // @values: month | primeYear | timeline
      default: 'month'
    },

    timeline: {
      type: Array,
      default: () => DEFAULT_MEMOIR_DATA.timeline
    }
  }

}
</script>

<style lang="stylus">
.memoir-chart
  width: 100%
  height: 400px
  background-color: white
  border-radius: 10px
  padding: 12px
</style>
