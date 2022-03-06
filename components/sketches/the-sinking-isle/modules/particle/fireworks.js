import * as THREE from 'three'
import * as Tone from 'tone'
import gsap from 'gsap'
import { random, math } from '../../engine/utils'
import { asset } from '../../engine/asset'
import { RENDER_LAYERS } from '../../utils/constants'
import vertexShader from '../../shaders/fireworks-text.vert'
import fragmentShader from '../../shaders/fireworks-text.frag'
import { midiToNoteMap, noteToMidiMap, generateMidiPartNoteEvents } from '~/utils/midi'

// @TODO: Create a fireworks folder, split codes

class FireworksBGM {
  constructor() {
    this.DEFAULT_NOTE = {
      name: 'C4',
      midi: noteToMidiMap['C4'],
      duration: 0.5,
      velocity: 1
    }

    this.setupInstruments()
    this.setupPiece()
  }

  // @TODO: Polish the instrument or directly use .mp3 to play
  setupInstruments() {
    this.piano = new Tone.PolySynth().toDestination()
    this.piano.volume.rampTo(-40, 0.1)

    const reverb = new Tone.Reverb(0.5).toDestination()
    // const pingPong = new Tone.FeedbackDelay(0, 0.01).toDestination()
    this.piano
      .connect(reverb)
      // .connect(pingPong)
  }

  setupPiece() {
    const instrument = this.piano
    const events = this.generateMidiPartNoteEvents()
    // const events = this.generatePentatonicScaleNoteEvents()
    const playRate = 1

    this.pieceStartOffset = events[0].time * 0.8
    this.pieceStartVolume = -25

    this.piece = new Tone.Part(
      (time, note) => {
        instrument.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity
        )
      }, events)

    this.piece.playbackRate = playRate
    this.piece.loop = true
    this.piece.loopEnd = parseInt(events[events.length - 1].time, 10)
    this.piece.humanize = true
  }

  generateMidiPartNoteEvents() {
    return generateMidiPartNoteEvents(
      asset.items.LoweTheStarryNightPiece
      // require('../../assets/midis/piano-etude-n1.json')
    )
  }

  generatePentatonicScaleNoteEvents() {
    const midis = random.shuffle([
      50, 51, 34, 38, 53, 24, 34, 22,
      26, 36, 41, 29, 43, 41, 24,
      27, 43, 34, 43, 32, 36, 46,
      46, 34
    ])

    let time = 0

    const events = midis.map(midi => {
      time += ((1 / 3) * 1)
      // midi -= 2

      return {
        ...this.DEFAULT_NOTE,
        midi,
        time,
        name: midiToNoteMap[midi]
      }
    })

    return events
  }

  // @TODO: Support fadeIn / fadeOut
  start() {
    this.piano.volume.rampTo(this.pieceStartVolume, 1)
    this.piece.start(Tone.now(), this.pieceStartOffset)
  }

  stop() {
    this.piano.volume.rampTo(-40, 1)
    this.piece.stop(0)
  }
}

class FireworksVFXSoundManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine
    this.mortarTags = ['fwUp1', 'fwUp2', 'fwUp3']
    this.shellTags = ['fwWhistle1', 'fwWhistle2']
    this.crackleTags = ['fwCrackle2']
    this.lightBoomTags = ['fwLightBoom1', 'fwLightBoom2', 'fwLightBoom3']
    this.heavyBoomTags = ['fwHeavyBoom1', 'fwHeavyBoom2']
  }

  play(name, volume, lock = true) {
    const feedback = new Tone.FeedbackDelay('4n', 0.2).toDestination()

    return this.audioEngine.play(name, {
      volume,
      lock,
      chains: [ feedback ]
    })
  }

  playRandomMortar(volume) {
    this.play(
      random.pick(this.mortarTags),
      volume || random.rangeFloor(-10, -5)
    )
  }

  playRandomShell(volume) {
    this.play(random.pick(this.shellTags), volume || random.rangeFloor(-20, -8))
  }

  playRandomCrackle(volume) {
    this.play(
      random.pick(this.crackleTags),
      volume || random.rangeFloor(-30, -20)
    )
  }

  playRandomLightBoom(volume) {
    this.play(
      random.pick(this.lightBoomTags),
      volume || random.rangeFloor(-25, -10)
    )
  }

  playRandomHeavyBoom(volume) {
    this.play(
      random.pick(this.heavyBoomTags),
      volume || random.rangeFloor(-30, -20)
    )
  }
}

// @TODO: Replace with GPGPU particles
class FireworksParticlePool {
  constructor() {
    this.current = 0
    this.particles = []
  }

  new(options) {
    this.current++
    if (this.current == this.particles.length) {
      this.current = 0
    }
    const i = this.current
    const list = this.particles

    list[i].alive = true
    list[i].x = options.x
    list[i].y = options.y
    list[i].z = options.z
    list[i].vy = options.vy || 0
    list[i].vz = options.vz || 0
    list[i].vx = options.vx || 0
    list[i].size = options.size || 1
    list[i].life = options.life || 1
    list[i].mass = options.mass || 1
    list[i].decay = options.decay || 10
    list[i].gravity = options.gravity || -9.82
    list[i].color.setHSL(options.h, options.s, options.l)
    list[i].color.r = options.r || 1.0
    list[i].color.g = options.g || 1.0
    list[i].color.b = options.b || 1.0

    // if(condition()) => action()
    list[i].condition = options.condition || function(p, d, t) {}
    list[i].action = options.action || function(p, d, t) {}
    // this is like behavior
    list[i].effect = options.effect || function(p, d, t) {}

    if (options.onCreate != undefined) {
      options.onCreate(list[i])
    }
  }
}

class FireworksParticle {
  constructor(i) {
    this.i = i
    this.x = 0
    this.y = 0
    this.z = 0
    this.vx = 0
    this.vy = 0
    this.vz = 0
    this.mass = 0
    this.alive = false
    this.size = 0
    this.color = new THREE.Color()
    this.decay = 0
    this.life = 0
    this.gravity = -9.82

    // Function callbacks
    this.condition = () => {}
    this.action = () => {}
    this.effect = () => {}
  }

  update(dt, time) {
    this.life -= dt
    this.size -= dt * this.decay

    const Cd = 0.47 // Dimensionless
    const rho = 1.22 // kg / m^3
    const A = Math.PI / 10000
    let Fx =
      (-0.5 * Cd * A * rho * this.vx * this.vx * this.vx) / Math.abs(this.vx)
    let Fz =
      (-0.5 * Cd * A * rho * this.vz * this.vz * this.vz) / Math.abs(this.vz)
    let Fy =
      (-0.5 * Cd * A * rho * this.vy * this.vy * this.vy) / Math.abs(this.vy)

    Fx = isNaN(Fx) ? 0 : Fx
    Fy = isNaN(Fy) ? 0 : Fy
    Fz = isNaN(Fz) ? 0 : Fz

    // Calculate acceleration ( F = ma )
    const ax = Fx / this.mass
    const ay = this.gravity + Fy / this.mass
    const az = Fz / this.mass

    // Integrate to get velocity
    this.vx += ax * dt
    this.vy += ay * dt
    this.vz += az * dt

    // Integrate to get position
    this.x += this.vx * dt * 100
    this.z += this.vz * dt * 100
    this.y += this.vy * dt * 100

    if (this.condition(this, dt, time)) {
      this.action(this, dt, time)
      this.reset()
    }

    this.effect(this, dt, time)

    if (this.life <= 0 || this.size <= 0) {
      this.reset()
    }
  }

  reset() {
    this.x = 0
    this.y = 0
    this.z = 0
    this.mass = 0
    this.alive = false
    this.size = 0
    this.decay = 0
    this.vx = 0
    this.vy = 0
    this.vz = 0
    this.life = 0
    this.level = 0
  }
}

class FireworksLight {
  constructor(container, x, y, z) {
    this.light = new THREE.PointLight(0x332200, 0, 100)
    this.alive = false
    this.light.position.set(x, y, z)
    container.add(this.light)
  }

  set(pos, color, intensity) {
    this.light.position.x = pos.x
    this.light.position.y = pos.y
    this.light.position.z = pos.z
    this.light.intensity = intensity
    this.light.color.r = color.r
    this.light.color.g = color.g
    this.light.color.b = color.b
    this.alive = true
  }

  update = function(dt, time) {
    if (this.light.intensity > 0) {
      this.light.intensity -= 0.1
    } else {
      this.alive = false
    }
  }
}

class FireworksLightManager {
  constructor(numOfLights, container) {
    this.lights = []
    this.hemisphereLight = new THREE.HemisphereLight(0xaa6677, 0xaacc22, 0.5)
    container.add(this.hemisphereLight)

    for (var i = 0; i < numOfLights; i++) {
      const light = new FireworksLight(container, 0, 0, 0)
      this.lights.push(light)
    }
  }

  newLight(position, color, intensity) {
    let use = 0
    for (var i = 0; i < this.lights.length; i++) {
      if (!this.lights[i].alive) {
        use = i
        break
      }
    }
    this.lights[use].set(position, color, intensity)
  }

  setHemi(intensity, r, g, b) {
    this.hemisphereLight.intensity = intensity
    this.hemisphereLight.color.r = r
    this.hemisphereLight.color.g = g
    this.hemisphereLight.color.b = b
  }

  hide() {
    this.hemisphereLight.intensity = 0
  }

  update(dt, time) {
    for (var i = 0; i < this.lights.length; i++) {
      if (this.lights[i].alive) {
        this.lights[i].update(dt, time)
      }
    }

    if (this.hemisphereLight.intensity > 0.5) {
      this.hemisphereLight.intensity -= 0.1
    } else {
      this.hemisphereLight.color.r = 0.66666
      this.hemisphereLight.color.g = 0.4
      this.hemisphereLight.color.b = 0.46666
    }
  }
}

// @TODO: Mock depth style
// @TODO: Optimize enter/exit animation
// @TODO: Replace pixel particle with FireworksParticle
class FireworksPatternEffectObject extends THREE.Mesh {

  constructor({ text, color }) {
    super()

    this.isAlive = true
    this.lifespan = -1
    this.layers.enable(RENDER_LAYERS.BLOOM)

    this.setupTextTexture(text, color)
    this.setupPoints()
    this.setupGeometry()
    this.setupMaterial(color)
  }

  setupTextTexture(text, color) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const width = 512
    const height = width
    const cx = width / 2
    const cy = height / 2

    canvas.width = width
    canvas.height = height

    ctx.save()
    const fontSize = math.clamp(100 - text.length * 5, 30, 60)
    ctx.translate(cx, cy)
    ctx.scale(1, -1)
    ctx.fillStyle = '#ccc' || color.getStyle()
    ctx.font = `500 ${fontSize}px sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, 0, 0)
    ctx.restore()

    this.textTexture = new THREE.CanvasTexture(canvas)
    this.textTexture.minFilter = THREE.LinearFilter
    this.textTexture.magFilter = THREE.LinearFilter

    this.textImageData = ctx.getImageData(0, 0, width, height)
  }

  setupPoints() {
    let threshold = 1
    let numVisible = 0
    this.numPoints = this.textImageData.width * this.textImageData.height
    this.originalColors = Float32Array.from(this.textImageData.data)

    for (let i = 0; i < this.numPoints; i++) {
      if (this.originalColors[i * 4 + 0] > threshold) numVisible++
    }

    this.threshold = threshold
    this.numVisible = numVisible
  }

  // @REF: https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
  setupGeometry() {
    const { numVisible, numPoints, threshold, originalColors } = this
    const geometry = new THREE.InstancedBufferGeometry()

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
    positions.setXYZ(0, -0.5, 0.5, 0.0)
    positions.setXYZ(1, 0.5, 0.5, 0.0)
    positions.setXYZ(2, -0.5, -0.5, 0.0)
    positions.setXYZ(3, 0.5, -0.5, 0.0)
    geometry.setAttribute('position', positions)

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2)
    uvs.setXYZ(0, 0.0, 0.0)
    uvs.setXYZ(1, 1.0, 0.0)
    uvs.setXYZ(2, 0.0, 1.0)
    uvs.setXYZ(3, 1.0, 1.0)
    geometry.setAttribute('uv', uvs)

    // index
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
    )

    const indices = new Uint16Array(numVisible)
    const offsets = new Float32Array(numVisible * 3)
    const angles = new Float32Array(numVisible)

    for (let i = 0, j = 0; i < numPoints; i++) {
      if (originalColors[i * 4 + 0] <= threshold) continue

      offsets[j * 3 + 0] = i % this.textImageData.width
      offsets[j * 3 + 1] = Math.floor(i / this.textImageData.width)

      indices[j] = i

      angles[j] = Math.random() * Math.PI
      j++
    }

    geometry.setAttribute(
      "pindex",
      new THREE.InstancedBufferAttribute(indices, 1, false)
    )
    geometry.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(offsets, 3, false)
    )
    geometry.setAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(angles, 1, false)
    )

    this.geometry = geometry
    // this.geometry = new THREE.PlaneGeometry(15, 15, 1, 1)
  }

  setupMaterial(color) {
    this.uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 50.0 },
      uDepth: { value: 1.0 },
      uSize: { value: 0.3 },
      uTextureSize: { value: new THREE.Vector2(this.textImageData.width, this.textImageData.height) },
      uTexture: { value: this.textTexture },
      // @TODO: Add touchTexture
      uTouch: { value: null },
      uColor: { value: color },
      music: {
        value: 1.0
      },
      opacity: {
        value: 0
      },
      enterProgress: {
        value: 0.5
      },
      exitProgress: {
        value: 0
      }
    }

    this.material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false
    })
  }

  async enter(duration = 0.6) {
    this.scale.x = 0.035
    this.scale.y = 0.035
    this.scale.z = 0.035

    gsap.to(this.uniforms.opacity, {
      value: 0.8,
      duration: duration,
      overwrite: true
    })
    gsap.to(this.uniforms.uSize, {
      value: 0.05,
      duration: duration,
      ease: "power2.out",
      overwrite: true
    })
    gsap.to(this.uniforms.uDepth, {
      value: 1,
      duration: duration,
      overwrite: true
    })
    gsap.to(this.uniforms.uRandom, {
      value: 1,
      duration: duration,
      overwrite: true
    })
    gsap.to(this.uniforms.enterProgress, {
      value: 1,
      duration: duration,
      ease: "power2.out",
      overwrite: true
    })
  }

  async exit() {
    if (!this.isAlive) {
      return
    }

    this.isAlive = false
    gsap.to(this.uniforms.opacity, {
      value: 0,
      duration: 2,
      overwrite: true
    })
    gsap.to(this.uniforms.uDepth, {
      value: 200,
      duration: 3.5,
      overwrite: true
    })
    gsap.to(this.uniforms.uSize, {
      value: 0,
      duration: 1.2,
      overwrite: true
    })
    gsap.to(this.uniforms.exitProgress, {
      value: 1,
      duration: 1.5
    })
    gsap.to(this.position, {
      y: '-=1',
      duration: 1.5,
      overwrite: true
    })
    await gsap.to(this.scale, {
      duration: 1.5
    })
    this.removeFromParent()
    this.geometry.dispose()
    this.material.dispose()
  }

  update(delta) {
    this.uniforms.uTime.value += delta

    // Auto exit
    if (this.lifespan > 0 && this.uniforms.uTime.value > this.lifespan) {
      this.exit()
    }
  }

}

// @REF: https://tympanus.net/codrops/2022/01/19/animate-anything-along-an-svg-path/
// @REF: https://github.com/Lallassu/fireworks
class FireworksPointsObject extends THREE.Points {
  constructor(particlesAmount, particlePool) {
    super()

    this.vs = `
      attribute float size;
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 50.0 / -mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
      }
    `

    this.fs = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4( vColor, 0.85 );
        gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
      }
    `

    this.frustumCulled = false

    this.uniforms = {
      pointTexture: { value: asset.items.fwSparkTexture }
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vs,
      fragmentShader: this.fs,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    })

    this.scale.set(0.035, 0.035, 0.035)

    this.particlesAmount = particlesAmount
    this.particlePool = particlePool
  }

  resetParticles() {
    const geometry = this.geometry
    const positions = []
    const colors = []
    const sizes = []
    this.particlePool.particles = []

    for (var i = 0; i < this.particlesAmount; i++) {
      this.particlePool.particles.push(new FireworksParticle(i))
      positions.push(0, 0, 0)
      colors.push(0, 0, 0)
      sizes.push(0)
    }
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(sizes, 1).setUsage(
        THREE.DynamicDrawUsage
      )
    )
  }

  update(dt, time) {
    const geometry = this.geometry
    const sizes = geometry.attributes.size.array
    const colors = geometry.attributes.color.array
    const positions = geometry.attributes.position.array

    const particles = this.particlePool.particles

    for (let i = 0; i < this.particlesAmount * 3; i += 3) {
      var pos = (i / 3) | 0
      if (!particles[pos].alive) {
        continue
      }

      particles[pos].update(dt, time)

      positions[i] = particles[pos].x
      positions[i + 1] = particles[pos].y
      positions[i + 2] = particles[pos].z

      sizes[pos] = particles[pos].size

      colors[i] = particles[pos].color.r
      colors[i + 1] = particles[pos].color.g
      colors[i + 2] = particles[pos].color.b
    }

    geometry.attributes.size.needsUpdate = true
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  }
}

// @TODO: Normalize position & size
class FireworksLauncher {
  constructor(manager) {
    this.manager = manager
    this.isAutoLaunch = true
    this.launchRadius = 400
    this.mortars = [new THREE.Vector3(0, -301, -300)]
    this.tmpArr2D = [0, 0]

    this.start()
  }

  newLaunchDelay() {
    return random.range(4, 6)
  }

  getLaunchPosition(isCenter = false) {
    const { sizes } = this.manager
    const origin = random.pick(this.mortars)
    const tmpArr2D = this.tmpArr2D

    if (isCenter) {
      tmpArr2D[0] = 0
      tmpArr2D[1] = 0
    } else {
      random.onCircle(random.range(0, this.launchRadius), tmpArr2D)
    }

    const responsiveScale = math.clamp(sizes.viewport.widthSize / 14, 0.5, 1)
    const x = origin.x + tmpArr2D[0] * responsiveScale
    const z = origin.z + tmpArr2D[1] * 0.2
    return new THREE.Vector3(x, origin.y + random.range(2, 4), z)
  }

  launch(position, options) {
    if (!this.manager.isPlaying) {
      return
    }

    if (!position) {
      position = this.getLaunchPosition()
    }

    this.manager.emit(position, options)
  }

  start() {
    this.launchTime = 0
    this.launchDelay = 1
  }

  stop() {
    this.launchTime = 0
  }

  update(dt, time) {
    this.launchTime += dt
    if (this.isAutoLaunch && this.launchTime >= this.launchDelay) {
      this.launchTime %= this.launchDelay
      this.launchDelay = this.newLaunchDelay()
      this.launch()
    }
  }
}

export class FireworksManager {
  constructor({ audioEngine, sizes, container }) {
    this.container = container
    this.sizes = sizes
    this.isPlaying = false

    this.bgm = new FireworksBGM()
    this.vfxSoundManager = new FireworksVFXSoundManager(audioEngine)
    this.lightManager = new FireworksLightManager(10, container)
    this.particlePool = new FireworksParticlePool()
    this.pointsObject = new FireworksPointsObject(16000, this.particlePool)
    this.launcher = new FireworksLauncher(this)

    this.setupEffects()

    this.container.add(this.pointsObject)
  }

  setupEffects() {
    this.mortarEffect = null
    this.shellEffect = null
    this.explodeEffect = null
    this.flairEffect = null
    this.crackleEffect = null

    this.maxSize = 20

    const self = this

    // Mortar effects are for the mortar when shooting up the shell.
    this.mortarEffect = pos => {
      // Random mortar sound
      this.vfxSoundManager.playRandomMortar()
      // Mortar light color -> yellowish
      this.lightManager.newLight(
        new THREE.Vector3(pos.x, 30, pos.z),
        new THREE.Color(0.7, 0.3, 0),
        10.0
      )

      for (var i = 0; i < 100; i++) {
        this.particlePool.new({
          effect: function(particle, dt, time) {
            particle.vz += Math.sin(time * random.value()) / 50
            particle.vx += Math.sin(time * random.value()) / 50
          },
          x: pos.x + 10 - random.value() * 20,
          y: pos.y + 10 + random.value() * 5,
          z: pos.z + 10 - random.value() * 20,
          mass: 0.002,
          gravity: random.value(),
          size: 20 + random.value() * 100,
          h: 0.5,
          s: 0.5,
          l: 0.5,
          r: 0.2,
          g: 0.2,
          b: 0.2,
          life: random.value() * 5,
          decay: 20 + random.value() * 20
        })
      }
    }

    // Shell effects are effects for the shell itself while
    // in the air.
    this.shellEffect = (particle, dt, time, seed) => {
      var max = 1
      var vx = 0
      var vz = 0
      switch (seed) {
        case 1:
          max = random.value() * 30
          break
        case 2:
          particle.x += Math.cos(Math.PI * 2 * time) * random.value() * 3
          particle.z += Math.sin(Math.PI * 2 * time) * random.value() * 3
          break
        case 3:
          if (random.value() > 0.5) {
            particle.size = 100
          } else {
            particle.size = 10
          }
          max = random.value() * 10
          vx = 2 - random.value() * 4
          vz = 2 - random.value() * 4
          break
      }
      for (var i = 0; i < max; i++) {
        self.particlePool.new({
          x: particle.x,
          y: particle.y,
          z: particle.z,
          mass: 0.002,
          gravity: -0.2,
          size: 25 + random.value() * 20,
          vx: vx,
          vz: vz,
          r: 1.0,
          g: 0,
          b: 0,
          h: 1.0,
          s: 0.5,
          l: 0.0,
          life: random.value() * 3,
          decay: 50
        })
      }
    }

    this.crackleEffect = (particle, dt, time, seed, color) => {
      var r = 0
      var g = 0
      var b = 0
      var h = 1.0
      var s = 1.0
      var l = 1.0
      switch (seed) {
        case 1:
          if (random.value() < 0.5) {
            this.vfxSoundManager.playRandomCrackle()
          }
          break
        case 2:
          if (random.value() < 0.5) {
            this.vfxSoundManager.playRandomLightBoom()
          }
          break
        case 3:
          if (random.value() < 0.5) {
            this.vfxSoundManager.playRandomHeavyBoom()
          }
          r = color.r * 2
          g = color.g * 2
          b = color.b
          h = random.value()
          s = random.value()
          l = random.value()
          break
      }
      for (var i = 0; i < 10 + random.value() * 150; i++) {
        var size = random.value() * 40
        var gravity = -0.2
        var vy = 1 - random.value() * 2
        var vx = 1 - random.value() * 2
        var vz = 1 - random.value() * 2
        var life = 0.1 + random.value() * 2
        if (random.value() > 0.5 && seed == 2) {
          r = color.r
          g = color.g
          b = color.b
          h = random.value()
          s = random.value()
          l = random.value()
        }
        self.particlePool.new({
          x: particle.x,
          y: particle.y,
          z: particle.z,
          size: size,
          mass: 0.02,
          gravity: gravity,
          r: r,
          g: g,
          b: b,
          h: h,
          s: s,
          l: l,
          vy: vy,
          vx: vx,
          vz: vz,
          life: life,
          decay: random.value() * 50
        })
      }
    }

    this.explodeEffect = function(particle, dt, time, seed) {
      for (var i = 0; i < 100 + random.value() * 100; i++) {
        var size = random.value() * 40
        var gravity = -0.5
        var vy = 1 - random.value() * 2
        var vx = 1 - random.value() * 2
        var vz = 1 - random.value() * 2
        var life = 0.1 + random.value()
        switch (seed) {
          case 1:
          case 2:
          case 3:
        }
        self.particlePool.new({
          x: particle.x,
          y: particle.y,
          z: particle.z,
          size: size,
          mass: 0.5,
          gravity: gravity,
          vy: vy,
          vx: vx,
          vz: vz,
          life: life,
          decay: random.value() * 50
        })
      }
    }

    // The flair effect for individual flairs.
    this.flairEffect = (particle, dt, time, seed, color, size) => {
      var r = 1.0
      var g = 0
      var b = 0
      switch (seed) {
        case 1:
          if (random.value() > 0.5) {
            particle.size = 150
          } else {
            particle.size = 10
          }
          break
        case 2:
          if (particle.vy < 0) {
            particle.x += Math.cos(Math.PI * 2 * time) * random.value() * 3
            particle.z += Math.sin(Math.PI * 2 * time) * random.value() * 3
          }
          break
        case 3:
          if (random.value() > 0.5) {
            particle.size = 100
          } else {
            particle.size = 10
          }
          if (random.value() > 0.5) {
            r = color.r
            g = color.g
            b = color.b
          }
          break
      }

      if (size > 80 && particle.life < 1.0) {
        this.crackleEffect(particle, dt, time, seed, color)
        particle.reset()
      }

      self.particlePool.new({
        x: particle.x,
        y: particle.y,
        z: particle.z,
        mass: 0.002,
        gravity: -0.2,
        size: 20 + random.value() * 40,
        r: r,
        g: g,
        b: b,
        h: 1.0,
        s: 0.5,
        l: 0.0,
        life: random.value() * 3,
        decay: 50
      })
    }

    this.textEffect = (particle, text) => {
      const positionRatio = 15.5

      this.patternEffectObject = new FireworksPatternEffectObject({
        text,
        color: particle.color.clone()
      })

      this.patternEffectObject.position.x = particle.x / positionRatio
      this.patternEffectObject.position.y = particle.y / positionRatio

      this.container.add(
        this.patternEffectObject
      )
      this.patternEffectObject.enter()
    }
  }

  emit(pos, options) {
    options = {
      text: null,
      seed: (Math.random() * 4) | 0,
      // Colors of the bomb effect
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      // Generate size of bomb
      size: 20 + Math.random() * Math.min(250, this.maxSize),
      ...options
    }

    let { seed, color } = options
    const { text, size } = options

    this.maxSize += 20

    // Random mortar effect
    // this.mortarEffect(pos)
    this.vfxSoundManager.playRandomShell()

    if (text && this.patternEffectObject) {
      this.patternEffectObject.exit()
    }

    this.particlePool.new({
      effect: (particle, dt, time) => {
        this.shellEffect(particle, dt, time, seed)
      },
      x: pos.x,
      z: pos.z,
      y: pos.y,
      size: size,
      mass: 0.5,
      vz: 0,
      vx: 0,
      vy: 5 + math.clamp(size / 10, text ? 5.4 : 5, 5.5),
      h: 0.9,
      s: 0.5,
      l: 0.5,
      r: color.r,
      g: color.g,
      b: color.b,
      life: 20,
      decay: 10 + Math.random() * 20,
      // @FIXME: explode small size particle
      condition: function(particle, dt, time) {
        return particle.vy <= 0.1 || particle.size <= 0
      },
      action: (particle, dt, time) => {
        // Play random boom based on size
        if (size > 200) {
          this.vfxSoundManager.playRandomHeavyBoom()
        } else {
          this.vfxSoundManager.playRandomLightBoom()
        }

        // color hemilight after generated color and intensity after size
        this.lightManager.setHemi(size / 40, color.r, color.g, color.b)

        // Random explode effect
        this.explodeEffect(particle, dt, time, seed)

        // Random gravity for the flairs
        const grav = -0.1 - random.value() * 2

        // Max life of particles
        const maxLife = 1 + random.value() * 6

        const radius = 50 + random.value() * 50
        const speed = 2 + random.value() * 2
        const offset = 2 / size
        const inc = Math.PI * (3.0 - Math.sqrt(5.0))

        if (text) {
          this.textEffect(particle, text)
          return
        }

        for (let i = 0; i < size; i++) {
          // Spinning effect
          let vx, vy, vz, r, phi
          switch (seed) {
            case 1:
              vy = Math.abs(i * offset - 1 + offset / 2)
              r = Math.sqrt(1 - Math.pow(vy, 2))
              phi = ((i + 1.0) % size) * inc
              vx = Math.cos(phi) * r
              vz = Math.sin(phi) * r
              vx *= speed
              vy *= speed
              vz *= speed
              break
            case 2:
              vy = 1 + random.value() * 2
              vx = Math.sin(i * Math.PI * 2 * speed) * (2 - random.value() * 4)
              vz = Math.sin(i * Math.PI * 2 * speed) * (2 - random.value() * 4)
              break
            default:
              vy = i * offset - 1 + offset / 2
              r = Math.sqrt(1 - Math.pow(vy, 2))
              phi = ((i + 1.0) % size) * inc
              vx = Math.cos(phi) * r
              vz = Math.sin(phi) * r
              vx *= speed
              vy *= speed
              vz *= speed
              break
          }

          this.particlePool.new({
            effect: (particle, dt, time) => {
              this.flairEffect(particle, dt, time, seed, color, size)
            },
            x: particle.x,
            y: particle.y,
            z: particle.z,
            size: size / 2,
            mass: 0.001,
            gravity: grav,
            vy: vy,
            vz: vz,
            vx: vx,
            r: color.r,
            g: color.g,
            b: color.b,
            h: random.value(),
            s: random.value(),
            l: random.value(),
            life: 0.5 + random.value() * maxLife,
            decay: random.value() * 100
          })
        }
      }
    })
  }

  onClick() {
    if (!this.isPlaying) {
      return
    }
    // @TODO
  }

  start() {
    this.launcher.start()
    this.bgm.start()
    this.pointsObject.resetParticles()
    this.pointsObject.visible = true
    this.isPlaying = true
  }

  // @TODO: Free up the memory
  stop() {
    this.launcher.stop()
    this.bgm.stop()
    this.lightManager.hide()
    this.pointsObject.visible = false
    this.isPlaying = false
  }

  update(dt, time) {
    if (!this.isPlaying) {
      return
    }
    this.lightManager.update(dt, time)
    this.launcher.update(dt, time)
    this.container.children.map(obj => {
      obj.update && obj.update(dt, time)
    })
  }
}
