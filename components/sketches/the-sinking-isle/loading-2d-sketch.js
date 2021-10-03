class LoadingSketch {

  constructor() {
    this.$canvas = document.createElement('CANVAS')
    this.context = this.$canvas.getContext('2d')
    this.$container = null

    // Clock and progress
    this.lastTime = 0
    this.elapsedDelta = 0
    this.delta = 0
    this.timeScale = 1
    this.isPlaying = true

    this.resize = () => this.forceUpdate()
  }

  init({ container = document.body }) {
    this.$container = container
    this.$container.appendChild(this.$canvas)
    window.addEventListener('resize', this.resize)

    if (this.isPlaying) {
      this.play()
    }
  }

  play() {
    this.forceUpdate()
    this.isPlaying = true
    this.update()
  }

  stop() {
    this.isPlaying = false
  }

  forceUpdate() {
    this.$canvas.width = window.devicePixelRatio * this.$container.clientWidth
    this.$canvas.height = window.devicePixelRatio * this.$container.clientHeight
    this.width = this.$canvas.width
    this.height = this.$canvas.height
  }

  render(delta) {
    const { context, width, height } = this

    if (!delta) {
      delta = this.delta
    }

    const playhead = this.elapsedDelta

    // Clear last frame
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)

    const t = Math.sin(playhead % Math.PI)
    const thickness = Math.max(50, Math.pow(t, 0.95) * width * 0.3)
    const rotation = playhead % Math.PI
    const cx = width / 2
    const cy = height / 2
    const length = 10

    context.fillStyle = '#383838'
    context.save()
    context.translate(cx, cy)
    context.rotate(rotation)
    context.fillRect(-thickness / 2, -length / 2, thickness, length)
    context.restore()
  }

  update(timestamp = performance.now()) {
    // in millisecond
    const diff = timestamp - this.lastTime
    this.lastTime = timestamp
    // in second
    this.delta = Math.min(diff / 1000, 0.1) * this.timeScale
    this.elapsedDelta += this.delta

    this.render()

    if (this.isPlaying) {
      requestAnimationFrame(timestamp => this.update(timestamp))
    }
  }

  export(nextDelta) {
    this.stop()
    this.render(nextDelta)
    const image = this.$canvas.toDataURL('image/png')
    return image
  }

  destory() {
    this.stop()

    window.removeEventListener('resize', this.resize)
    this.$container.removeChild(this.$canvas)
  }

}

export const loadingSketch = new LoadingSketch()
