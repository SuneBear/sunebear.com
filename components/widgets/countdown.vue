<template lang="pug">
client-only
  vue-countdown(
    v-slot="{ days, hours, minutes, seconds }"
    @end="handleCoundownEnd"
    :time="timeDiff"
  )
    section.countdown-widget
      header.countdown-heading
        slot( :hours="hours" :days="days" )
      hr(aria-orientation="horizontal" orientation="horizontal")
      .horizontal-stack
        .time-group.is-day
          .time-value {{ days }}
          .time-label days
        .time-divider
        .time-group
          .time-value {{ hours }}
          .time-label hours
        .time-divider :
        .time-group
          .time-value {{ minutes }}
          .time-label minutes
        .time-divider :
        .time-group
          .time-value {{ seconds }}
          .time-label seconds
</template>

<script>
import VueCountdown from '@chenfengyuan/vue-countdown'
export default {
  name: 'Countdown',
  components: {
    VueCountdown
  },
  props: {
    now: {
      type: [ String, Number ]
    },
    endDate: {
      type: Date,
      default: new Date(Date.now())
    }
  },
  computed: {
    timeDiff: (vm) => {
      const now = new Date(vm.now || Date.now())
      console.log(111, vm.now)
      const timeDiff = vm.endDate.getTime() - now.getTime()
      return timeDiff
    }
  },

  methods: {
    handleCoundownEnd() {
      this.$emit('end')
    }
  }
}
</script>

<style lang="stylus">
.countdown-widget
  color: $black;
  padding: 24px 16px;
  font-weight: bold;
  border-radius: 10px;
  font-size: 3.8vmin;

  .countdown-heading
    text-align: center;

  hr
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid $black;
    margin: 1em 0;
    padding: 0;

  .time-divider
    font-weight: bold;
    color: #8e2b27;
    position relative
    top: -0.4em;
    font-size: 2em;

  .time-group
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    & + .time-group
      position relative

    .time-value
      font-size: 2em;
      font-weight: bold;
      color: #8e2b27;

    .time-label
      font-size: 0.9em;
      text-transform: uppercase

.horizontal-stack
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  & > :not(style) ~ :not(style)
    margin-top: 0px;
    margin-bottom: 0px;
    margin-left: 4vmin;
</style>
