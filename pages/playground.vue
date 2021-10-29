<template lang="pug">
.page.page-playground(
)
  .container.pt-16
    .text-h4.mb-10 UI Playground
    .section-ink-button
      .text-h5.mb-4 ink-button
      .row.no-gutters
        ink-button() default
        ink-button( type="primary" ) primary
        ink-button( type="success" ) success
        ink-button( type="danger" ) danger

</template>

<script>
export default {

  head() {
    return {
      title: 'Playground'
    }
  }

}
</script>

<style lang="stylus">
.page-playground
  .ink-button + .ink-button
    margin-left: 8px
</style>
