import * as THREE from 'three'
import anime from 'animejs'
import Module from '../engine/module'
import { Color, lock, math, getEasePlayhead } from '../engine/utils'

export default class Test extends Module {
  constructor(sketch) {
    super(sketch)

    this.upMoveElapsed = 0
    this.needTransitionIn = true

    this.mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0)
    this.mousePlaneTarget = new THREE.Vector3()
    this.raycaster = new THREE.Raycaster()
    this.maxWorldSize = this.config.worldSize = 0.95 / 2

    this.setupTextures()
    this.setupInstance()
  }

  setupEvents() {
    this.control.on('tapdown.test', () => {
      this.audio.play('pin')
    })
  }

  setupTextures() {
    this.textures = {}

    this.textures.repeatCount = 2

    this.textures.color = this.asset.items.testTexture
    this.textures.color.encoding = THREE.sRGBEncoding
  }

  setupInstance() {
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
    const material = new THREE.MeshPhysicalMaterial({
      transmission: 0.5,
      map: this.textures.color,
      side: THREE.DoubleSide,
      transparent: true
    })

    this.instance = this.mesh = new THREE.Mesh(
      geometry,
      material
    )
  }

  @lock
  async transitionIn() {
    if (!this.needTransitionIn) {
      return
    }

    this.instance.scale.set(0, 0, 0)
    this.scene.add(this.instance)
    const animer = anime({
      targets: this.instance.scale,
      x: 1,
      y: 1,
      z: 1,
      duration: 2000,
      delay: 500
    })
    await animer.finished
    this.needTransitionIn = false
  }

  play() {
    super.play()
    this.setupEvents()
    this.audio.play('testAudio', { loop: true })
  }

  pause() {
    super.pause()
    this.control.off('tapdown.test')
  }

  update(delta) {
    this.transitionIn()

    this.upMoveElapsed += delta
    this.mesh.position.y = 2 * getEasePlayhead({ elapsed: this.upMoveElapsed, endTime: 2 })

    if (this.control.isPressed('leftArrow')) {
      this.mesh.position.x -= 0.01
    }
    if (this.control.isPressed('rightArrow')) {
      this.mesh.position.x += 0.01
    }
    if (this.control.isPressed('upArrow')) {
      this.mesh.position.z -= 0.01
    }
    if (this.control.isPressed('downArrow')) {
      this.mesh.position.z += 0.01
    }

    if (this.control.isPressed('tap')) {
      this.raycaster.setFromCamera(this.control.getMouse(), this.camera)
      const hit = this.raycaster.ray.intersectPlane(this.mousePlane, this.mousePlaneTarget)
      this.mesh.position.x = hit.x
      this.mesh.position.z = hit.z
    }

    this.mesh.position.x += this.random.range(-0.01, 0.01)
    this.mesh.position.y += this.random.range(-0.01, 0.01)
    this.mesh.position.z += this.random.range(-0.01, 0.01)

    this.mesh.position.x = math.clamp(this.mesh.position.x, -this.maxWorldSize, this.maxWorldSize)
    this.mesh.position.z = math.clamp(this.mesh.position.z, -this.maxWorldSize, this.maxWorldSize)

    this.mesh.rotation.y += 0.01
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.z += 0.01
  }
}
