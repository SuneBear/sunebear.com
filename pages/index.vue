<template lang="pug">
.page.page-index(
)
  .d-flex.justify-center.align-center.countdown-wrapper.flex-column
    countdown(
      v-if="!isEnd"
      :class="{ 'is-hide': !isOpenCountDown  }"
      :now="now"
      :end-date="countdownEndDate"
      @end="handleCountdownEnd"
    )
    img.end-photo(
      src="@/assets/end.jpg"
      :class="{ 'is-hide': !isEnd  }"
    )
    el-button.mt-8(
      v-if="!isOpenCountDown"
      round
      @click="isOpenCountDown = !isOpenCountDown"
    ) {{ isOpenCountDown ? 'Close' : 'Open' }}
</template>

<script>
import spacetime from 'spacetime'
const TIME_ZONE = 'asia/shanghai'
const countdownEndDate = spacetime('2021-11-30 23:59:59', TIME_ZONE)

console.log(spacetime('2021-11-30 23:58', TIME_ZONE))

export default {

  data() {
    return {
      paperName: 'secondary',
      isOpenCountDown: true,
      isEnd: false,
      countdownEndDate: countdownEndDate.toNativeDate(),
    }
  },

  computed: {
    now() {
      if (this.$route.query.now) {
        return Number(this.$route.query.now)
      }

      return null
    }
  },

  head() {
    return {
      title: 'Home'
    }
  },

  methods: {
    handleCountdownEnd() {
      this.isEnd = true
    }
  }

}
</script>

<style lang="stylus">
.page-index
  background: $primary
  color: $secondary

  .is-hide
    height: 0
    opacity: 0.01

  .countdown-wrapper
    width: 90vw
    position absolute
    top: 40%
    left: 50%
    transform: translate3d(-50%, -50%, 0)

  .end-photo
    max-width: 700px
    width: 100%
    object-fit: cover

</style>
