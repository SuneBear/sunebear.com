import { Random } from './engine/utils/random'
import { sleep } from './engine/utils/async'

const random = Random(true, 'Loading')

// @TODO: Adjust sketch transition before destory
// @TODO: Add title of main sketch
class LoadingSketch {

  constructor() {
    if (process.server) {
      return
    }

    this.$canvas = document.createElement('CANVAS')
    this.context = this.$canvas.getContext('2d')
    this.$container = null
    this.$vm = null

    // Clock and progress
    this.lastTime = 0
    this.elapsedDelta = 0
    this.delta = 0
    this.timeScale = 1
    this.isPlaying = true

    // Config and states
    this.circleRadius = 130
    this.circleRadiusDelta = 1.5
    this.circleLineRadius = 100
    this.circleLines = 25
    this.dotSize = 1
    this.dotsAmount = 50
    this.amountAcceleration = 1.2
    this.dotsRings = 20
    this.dotsRingDistance = 50

    this.resize = () => this.forceUpdate()
  }

  init({ container = document.body, $vm }) {
    this.$container = container
    this.$vm = $vm
    this.$container.appendChild(this.$canvas)
    window.addEventListener('resize', this.resize)
    this.generateCircleDots()

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

  generateCircleDots() {
    this.dots = []
    this.maskDots = []
    this.circleRadius = 130
    this.dotsAmount = 50
    this.dotsRingDistance = 50

    for (let ring = 0; ring < this.dotsRings; ring++) {
      for (let dot = 0; dot < this.dotsAmount; dot++) {
        const place = Math.random() * Math.PI * 2
        const x = this.circleRadius * Math.cos(place)
        const y = this.circleRadius * Math.sin(place)
        this.dots.push({ x, y, ring })
      }
      this.dotsRingDistance *= 1.03
      this.circleRadius += this.dotsRingDistance
      this.dotsAmount *= this.amountAcceleration
    }
  }

  render(delta) {
    const { context, width, height } = this

    if (!delta) {
      delta = this.delta
    }

    const playhead = this.elapsedDelta
    const rotation = playhead / 50 % Math.PI
    const cx = width / 2
    const cy = height / 2

    // Clear last frame
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)

    // Set style
    const scale = Math.max(window.devicePixelRatio, 0)
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    context.lineWidth = 2

    // Render Dots
    context.save()
    context.lineWidth = 0.5
    context.translate(cx, cy)
    context.rotate(rotation)
    context.scale(scale, scale)
    this.dots.map(dot => {
      context.beginPath()
      context.strokeStyle = dot.ring % 2 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.8)'
      context.arc(dot.x, dot.y, this.dotSize, 0, 2 * Math.PI)
      context.stroke()
    })
    context.restore()

    // Render Lines
    context.save()
    context.lineWidth = 2
    context.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    context.translate(cx, cy)
    context.scale(scale, scale)
    for (let i = this.circleLines; i >= 0; i--) {
      context.beginPath()
      let y = -this.circleLineRadius + (i*2*this.circleLineRadius) / this.circleLines
      let x = Math.sqrt(Math.pow(this.circleLineRadius, 2) - Math.pow(y, 2))
      if (i * 2 > this.circleLines) {
        const alpha = 0.3 + (-i * 0.012)
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`
      } else {
        const alpha = 0.4 + (-i * 0.01)
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`
      }
      context.moveTo(-x, y)
      context.lineTo(x, y)
      context.stroke()
    }
    context.restore()

    // Render Background Prgress
    const maskRadius = scale * this.circleLineRadius * 1.01
    context.save()
    context.translate(cx, cy)
    context.beginPath()
    // context.fillStyle = 'transparent'
    context.rect(-maskRadius, -maskRadius, maskRadius * 2, Math.min(maskRadius + 12, this.$vm.loadProgress * maskRadius))
    // context.arc(0, 0, maskRadius, 0, 2 * Math.PI)
    context.clip()
    context.beginPath()
    context.fillStyle = '#808080'
    context.arc(0, 0, maskRadius, 0, 2 * Math.PI)
    context.fill()
    context.restore()

    // Render Mountains
    context.save()
    context.translate(cx, cy)
    context.scale(scale, scale)
    context.fillStyle = '#ffffff'
    context.strokeStyle = '#aaa'
    context.lineWidth = 1.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    const offsetY = 4
    for (let y = 1; y < 2; y += 1) {
      context.beginPath()
      context.moveTo(-this.circleLineRadius, y)
      for (let x = 0; x < this.circleLineRadius * 2; ++x) {
        // peaks and speed
        let n = 1 - random.noise1D(x / 50 + playhead / (y * 10) + y) * 0.5
        let nextY = x > this.circleLineRadius ? this.circleLineRadius * 2 - x: Math.abs(x)
        nextY *= n / 2
        // change x to radius? // change x location, change peak, change peak, change location
        context.lineTo(x - this.circleLineRadius, nextY > 0 ? -nextY : nextY)
      }
      context.lineTo(this.circleLineRadius, offsetY)
      context.lineTo(-this.circleLineRadius, offsetY)
      context.closePath()
      context.fill()
      context.stroke()
    }
    context.restore()

    // Render Dusty noise
    context.save()
    context.translate(cx, cy)
    context.rotate(Math.PI)
    context.arc(0, 0, maskRadius, 0, 2 * Math.PI)
    context.clip()
    context.fillStyle = '#ccc'
    for(let i = 0; i < maskRadius * 10 * 0.6; i++){
      context.beginPath()
      let x, y
      const point = this.maskDots[i]
      if (point) {
        x = point.x
        y = point.y
      } else {
        x = random.range(-maskRadius, maskRadius)
        y = (0.5 - random.noise1D(x)) * maskRadius
        this.maskDots[i] = { x, y }
      }
      context.arc(x, y, 1, 0, 2 * Math.PI)
      context.fill()
    }
    context.restore()
  }

  update(timestamp = performance.now()) {
    // in millisecond
    const diff = timestamp - this.lastTime
    this.lastTime = timestamp
    // in second
    this.delta = Math.min(diff / 1000, 0.1) * this.timeScale
    this.elapsedDelta += this.delta

    this.render(this.delta)

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

  async fadeout() {
    await sleep(200)
    this.$canvas.classList.add('fade-out')
    await sleep(1000)
  }

  async destory() {
    await this.fadeout()
    this.stop()
    window.removeEventListener('resize', this.resize)
    this.$container?.removeChild(this.$canvas)
  }

}

export const loadingSketch = new LoadingSketch()
