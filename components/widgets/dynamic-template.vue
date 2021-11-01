<script>
export default {
  props: {
    template: {
      required: true,
      type: String
    },

    templateData: {
      type: Object,
      default: () => ({})
    }
  },

  render (h) {
    if (!process.client) {
      return null
    }

    return h({
      props: Object.keys(this.templateData),
      template: `<span>${this.template}</span>`
    }, { props: this.templateData })
  }
}
</script>
