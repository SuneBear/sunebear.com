<template lang="pug">
.ink-button(
)
  el-button( v-bind="$props" )
    slot
</template>

<script>
import { Button } from 'element-ui'

export default {

  props: {
    ...Button.props,
  }

}
</script>

<style lang="stylus">
.ink-button
  null
</style>
