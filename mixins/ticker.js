/**
 * Ticker
 */
const ticker = {}
ticker.start = Date.now()
ticker.current = ticker.start
ticker.elapsed = 0
ticker.delta = 16

let isPlaying = false

/**
 * Callbacks
 */
const callbacks = []

/**
 * Tick
 */
const tickCallback = () => {
  window.requestAnimationFrame(tickCallback)

  isPlaying = true

  // Update ticker
  const current = Date.now()

  ticker.delta = current - ticker.current
  ticker.elapsed = current - ticker.start
  ticker.current = current

  if (ticker.delta > 60) {
    ticker.delta = 60
  }

  // Call callbacks
  for (const _callback of callbacks) {
    _callback()
  }
}

process.client && window.requestAnimationFrame(tickCallback)

/**
 * Mixin
 */
export default {
  data() {
    return {
      enableTicker: true
    }
  },

  created: function() {
    this.ticker = ticker
  },

  watch: {
    enableTicker () {
      if (this.enableTicker) {
        this.startTick()
      } else {
        this.stopTick()
      }
    }
  },

  mounted() {
    // Enable for SSR component
    if (!isPlaying) {
      window.requestAnimationFrame(tickCallback)
    }
    this.startTick()
  },

  activated() {
    this.startTick()
  },

  deactivated() {
    this.stopTick()
  },

  methods: {
    startTick() {
      if (this.enableTicker) {
        if (callbacks.includes(this.onTick)) return
        callbacks.push(this.onTick)
      }
    },
    stopTick() {
      const index = callbacks.findIndex(_item => _item === this.onTick)
      if (index !== -1) {
        callbacks.splice(
          index,
          1
        )
      }
    },
    onTick: function() {}
  }
}
