import * as THREE from 'three'
import easeAppear from 'eases/sine-out'
import easeDisappear from 'eases/sine-in'
import Module from '../engine/module'
import { math, ObjectPool } from '../engine/utils'
import { EnvTracePrticleObject } from '../objects/env-trace-particle.object'
import { removeFromArray } from '../utils/three-util'

export default class EnviromentTrace extends Module {
  constructor(sketch) {
    super(sketch)

    const RTSIZE = 256
    this.enableDrawingDebug = false
    this.softMap = this.asset.items.softCircleTexture
    this.renderTarget = new THREE.WebGLRenderTarget(RTSIZE, RTSIZE)
    this.renderTarget.depthBuffer = false
    this.renderTarget.texture.minFilter = THREE.LinearFilter
    this.renderTarget.texture.magFilter = THREE.LinearFilter
    this.renderTarget.texture.wrapS = this.renderTarget.texture.wrapT =
      THREE.ClampToEdgeWrapping

    this.projection = new THREE.Matrix4()
    this.view = new THREE.Matrix4()

    const windowView = 40
    this.orthoCam = new THREE.OrthographicCamera(-1, 1, -1, 1, -100, 100)
    this.orthoCam.left = -windowView / 2
    this.orthoCam.right = windowView / 2
    this.orthoCam.top = windowView / 2
    this.orthoCam.bottom = -windowView / 2
    this.orthoCam.zoom = 1
    this.orthoScene = new THREE.Scene()

    this.clearColor = new THREE.Vector3(0, 0, 0)
    this.tmpColor = new THREE.Vector3(0, 0, 0)

    this.globalAlpha = { value: 1, tweening: false }
    this.activeParticles = []
    this.tmpVec2Arr = [0, 0]
    this.lastPosition = new THREE.Vector3()
    this.hasLastPosition = false

    this.particlePool = new ObjectPool({
      create: () => {
        const mesh = new EnvTracePrticleObject({
          map: this.softMap
        })

        mesh.userData = {
          time: 0,
          directionX: 0,
          directionY: 0,
          velocity: new THREE.Vector3(),
          // angle: Math.atan2(userChar.direction.z, userChar.direction.x),
          userSpeed: 0,
          strength: 1,
          delay: this.random.range(0),
          duration: this.random.range(0.4, 0.5),
          durationIn: this.random.range(0.9, 1),
          durationOut: 3,
          minSize: 2,
          size: this.random.range(2, 5),
          // position: position.clone(),
          alpha: 0,
          opacity: 1,
          active: false
        }
        return mesh
      }
    })

    this.traceUniforms = {
      envTraceMap: {
        value: this.renderTarget.texture
      },
      envTraceProjection: {
        value: this.projection
      },
      envTraceView: {
        value: this.view
      }
    }

    if (this.enableDrawingDebug) {
      this.submitFrame.addPostRenderCallback(() => this.submitPreRender())
    } else {
      this.submitFrame.addPreRenderCallback(() => this.submitPreRender())
    }
  }

  getTraceUniforms() {
    return this.traceUniforms
  }

  submitPreRender() {
    this.renderer.getClearColor(this.tmpColor)
    if (!this.enableDrawingDebug) {
      this.renderer.setRenderTarget(this.renderTarget)
    }
    this.renderer.setClearColor(this.clearColor)
    this.renderer.clear()
    this.renderer.render(this.orthoScene, this.orthoCam)
    this.renderer.setRenderTarget(null)
    this.renderer.setClearColor(this.tmpColor)
  }

  update(delta, elapsed) {
    const canvas = this.renderer.domElement

    if (canvas.width === 0 || canvas.height === 0) return

    const userChar = this.player
    const position = this.player.position
    const target = this.player.targetPos
    const distThreshold = 0.3
    const distThresholdSq = distThreshold * distThreshold

    // @TODO: Support multiple particle types in different materials
    if (
      !this.hasLastPosition ||
      this.lastPosition.distanceToSquared(position) >= distThresholdSq
    ) {
      const mesh = this.particlePool.next()
      const d = mesh.userData
      d.active = true
      d.time = 0
      d.alpha = 0
      d.directionX = userChar.direction.x
      d.directionY = userChar.direction.z
      d.velocity.copy(userChar.velocity)
      d.userSpeed = userChar.totalSpeedAlpha

      const r = this.random.insideCircle(0.5, this.tmpVec2Arr)
      mesh.position.set(position.x, position.z, 0)
      mesh.position.x += r[0]
      mesh.position.y += r[1]
      mesh.position.x += userChar.direction.x * 1
      mesh.position.z += userChar.direction.z * 1

      this.orthoScene.add(mesh)
      this.activeParticles.push(mesh)
      this.lastPosition.copy(position)
      this.hasLastPosition = true
    }

    this.activeParticles.map(mesh => {
      const p = mesh.userData
      p.time += delta
      const maxVel = 0.15
      const velx = math.clamp(p.velocity.x, -maxVel, maxVel)
      const velz = math.clamp(p.velocity.z, -maxVel, maxVel)
      mesh.position.x += velx * 0.03
      mesh.position.z += velz * 0.03

      const curTime = Math.max(0, p.time - p.delay)
      const totalDur = p.duration + p.durationIn + p.durationOut
      if (curTime < p.durationIn) {
        p.alpha = easeAppear(math.clamp01(curTime / p.durationIn))
      } else if (curTime >= p.durationIn + p.duration) {
        const start = Math.max(0, curTime - (p.durationIn + p.duration))
        p.alpha = 1 - easeDisappear(math.clamp01(start / p.durationOut))
      } else {
        p.alpha = 1
      }
      if (curTime >= totalDur) {
        p.active = false
      }
      mesh.material.uniforms.color.value.setRGB(
        1,
        p.directionX * 0.5 + 0.5,
        p.directionY * 0.5 + 0.5
      )
      mesh.material.uniforms.opacity.value =
        p.alpha * p.opacity * this.globalAlpha.value
      mesh.scale.setScalar(math.lerp(p.minSize, p.size, Math.pow(p.alpha, 1)))
    })

    this.activeParticles.map((mesh, i) => {
      if (!mesh.userData.active) {
        this.particlePool.release(mesh)
        removeFromArray(this.activeParticles, i)
      }
    })

    const { orthoCam, projection, view } = this
    orthoCam.position.set(target.x, target.z, 0)
    orthoCam.updateProjectionMatrix()
    orthoCam.updateMatrixWorld()

    projection
      .copy(orthoCam.projectionMatrix)
      .multiply(orthoCam.matrixWorldInverse)
    view.identity()
  }
}
