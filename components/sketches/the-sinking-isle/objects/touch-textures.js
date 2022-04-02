import * as THREE from 'three'

const easeOutSine = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b
}

const easeOutQuad = (t, b, c, d) => {
  t /= d
  return -c * t * (t - 2) + b
}

const DEBUG = false

export class TrailTouchTexture {
  constructor(options) {
    this.size = 256
    this.show = false
    // this.width = window.innerWidth
    // this.height = window.innerHeight
    this.width = this.height = this.size
    this.baseIntensity = 0.6
    this.needFlipY = true

    this.maxAge = 128
    this.radius = 0.045 * this.size
    // this.radius = 0.15 * 1000;

    this.speed = 0.1 / this.maxAge
    // this.speed = 0.01;

    Object.assign(this, options)

    this.trail = []
    this.last = null

    this.initTexture()

    if (DEBUG) {
      this.canvas.style = "position: absolute"
      document.body.append(this.canvas)
    }
  }

  initTexture() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')

    this.ctx.fillStyle = '#808080'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.texture = new THREE.Texture(this.canvas)
    this.texture.flipY = this.needFlipY
    this.canvas.id = 'trailTouchTexture'
  }

  update() {
    this.clear()
    let speed = this.speed
    this.trail.forEach((point, i) => {
      let f = point.force * speed * (1 - point.age / this.maxAge)
      let x = point.x
      let y = point.y

      point.x += point.vx * f
      point.y += point.vy * f
      point.age++
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      }
    })

    this.trail.forEach((point, i) => {
      this.drawPoint(point)
    })

    if (DEBUG) {
      // this.ctx.fillStyle = "rgba(255,0,0,0.5)";
      // this.ctx.fillRect(0, 0, 200, 200);
      // this.ctx.fillStyle = "rgba(0,255,0,0.5)";
      // this.ctx.fillRect(50, 0, 200, 200);
    }

    this.texture.needsUpdate = true
  }
  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
  addTouch(point) {
    let force = 0
    let vx = 0
    let vy = 0
    if (this.needFlipY) {
      point.y = 1.0 - point.y
    }
    const last = this.last
    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      let d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d

      force = Math.min(dd * 20000, 1)
      // force = Math.sqrt(dd)* 50.;
      // force = 1;
    }
    this.last = {
      x: point.x,
      y: point.y
    }

    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }
  drawPoint(point) {
    const ctx = this.ctx
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height
    }

    let intensity = 1

    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
    } else {
      intensity = easeOutQuad(
        1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
        0,
        1,
        1
      )
    }
    intensity *= point.force

    const radius = this.radius
    // let color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) *
    //   255}, ${intensity * 255}`;
    let color = '255,255,255'

    let offset = this.size * 5
    // 1. Give the shadow a high offset.
    ctx.shadowOffsetX = offset // (default 0)
    ctx.shadowOffsetY = offset // (default 0)
    ctx.shadowBlur = radius * 4 // (default 0)
    ctx.shadowColor = `rgba(${color},${this.baseIntensity * intensity})` // (default transparent black)

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255,0,0,1)'
    // 2. Move the circle to the other direction of the offset
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}
