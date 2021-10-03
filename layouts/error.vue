<template>
  <div></div>
</template>

<script>
export default {
  props: ['error'],

  layout: 'error',

  created() {
    if (this.error.statusCode === 404) {
      this.$router.replace('/')
    }
  }
}
</script>
