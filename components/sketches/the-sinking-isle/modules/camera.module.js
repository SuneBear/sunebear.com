import * as THREE from 'three'
import anime from 'animejs'
import { __DEBUG__ } from '~/utils/dev'

import { OrbitControls } from '../utils/hack-deps/three/orbit-controls'
import Module from '../engine/module'
import { math } from '../engine/utils'

export default class CameraModule extends Module {
  constructor(sketch) {
    super(sketch)

    // Set up
    this.mode = 'debug' // default | debug
    this.defaultPresetIndex = 0

    this.setInstance()
    this.setModes()
    this.setupPlayerFollowSystem()
    setTimeout(() => {
      this.listenModePresetSwitch()
    })
  }

  setInstance() {
    // Set up
    this.instance = new THREE.PerspectiveCamera(
      30,
      this.config.width / this.config.height,
      0.1,
      1000
    )
    this.instance.rotation.reorder('YXZ')
    this.instance.module = this

    this.scene.add(this.instance)
  }

  setModes() {
    this.modes = {}

    const normalPosY = this.config.worldSize / 6
    this.modePresets = [
      { name: 'normal', fov: 15, zoom: 1, position: [ -2, normalPosY, normalPosY * 1.5 ] },
      { name: 'god', fov: 30, zoom: 1, position: [ 0, 80, 0 ] },
      { name: 'ortho', fov: 45, zoom: 1, position: [ 0, this.config.worldSize * 3.8, 0 ] }
    ]

    // Default
    this.modes.default = {}
    this.modes.default.instance = this.instance.clone()
    this.modes.default.instance.rotation.reorder('YXZ')

    // Debug
    this.modes.debug = {}
    this.modes.debug.instance = this.instance.clone()
    this.modes.debug.instance.rotation.reorder('YXZ')

    this.modes.debug.orbitControls = new OrbitControls(
      this.modes.debug.instance,
      this.container
    )
    this.modes.debug.orbitControls.enabled = this.modes.debug.active
    this.modes.debug.orbitControls.enableRotate = __DEBUG__
    this.modes.debug.orbitControls.enableZoom = __DEBUG__
    this.modes.debug.orbitControls.enablePan = false
    this.modes.debug.orbitControls.screenSpacePanning = false
    this.modes.debug.orbitControls.enableDamping = true
    this.modes.debug.orbitControls.enableKeys = false
    this.modes.debug.orbitControls.zoomSpeed = 0.25
    this.modes.debug.orbitControls.update()

    this.switchPresetByIndex(this.defaultPresetIndex)
  }

  setupPlayerFollowSystem() {
    this.currentTarget = new THREE.Vector3()
    this.currentUIZoom = 0
    this.userZoomDistance = 10
    this.offset = new THREE.Vector3(1, 1, 1)
    this.offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), math.degToRad(45 * -1))
    this.frustum = new THREE.Frustum()
    this.projScreenMatrix = new THREE.Matrix4()
    this.first = true

    this.playerFollow = {
      currentTarget: new THREE.Vector3(),
      currentPosition: new THREE.Vector3(),
      currentDistance: 12,
      distanceSpring: 5,
      minSpeedZoomDistance: 0,
      maxSpeedZoomDistance: 1,
      speedZoomDistance: 0,
      speedZoomSpringIn: 0.25,
      speedZoomSpringOut: 4,
      shake: 0,
      shakeSpeed: 1,
      shakeTime: 0,
    }

    // this.modes.debug.orbitControls.target = this.playerFollow.currentTarget
  }

  listenModePresetSwitch() {
    this.control.on('keydown.camera', (key) => {
      if (typeof key !== 'number') {
        return
      }

      this.switchPresetByIndex(key - 1)
    })
  }

  async switchPresetByIndex(index) {
    const camera = this.modes.debug.instance

    // Update preset
    this.curPreset = this.modePresets[math.clamp(index, 0, 2)]

    // Update offset
    if (this.curPreset.name === 'normal') {
      this.offset?.set(1, 1, 1)
      this.offset?.applyAxisAngle(new THREE.Vector3(0, 1, 0), math.degToRad(45 * -1))
    } else {
      this.offset?.set(0, 0, 0)
    }

    this.instance.updateMatrix() // To be used in projection
    this.instance.updateMatrixWorld() // To be used in projection

    // Anime preset
    if (this.switchPresetAnimer) {
      this.switchPresetAnimer.pause()
    }
    this.switchPresetAnimer = anime.timeline({
      duration: 699,
      easing: 'linear'
    })
    const [x,y,z] = this.curPreset.position
    this.switchPresetAnimer
      .add({
        targets: camera.position,
        x,
        y,
        z
      })
      .add({
        targets: camera,
        zoom: this.curPreset.zoom
      }, 0)
    // await this.switchPresetAnimer.finished
    // camera.position.set(...this.curPreset.position)
    // camera.zoom = this.curPreset.zoom
  }

  resize() {
    this.instance.aspect = this.config.width / this.config.height
    this.instance.updateProjectionMatrix()

    this.modes.default.instance.aspect = this.config.width / this.config.height
    this.modes.default.instance.updateProjectionMatrix()

    this.modes.debug.instance.aspect = this.config.width / this.config.height
    this.modes.debug.instance.updateProjectionMatrix()
  }

  update(delta) {
    this.updateFocusTargetSystem(delta)
    this.updatePlayerFollowSystem(delta)

    // Update debug orbit controls
    this.modes.debug.orbitControls.update()

    // Apply coordinates
    this.instance.updateMatrix() // To be used in projection
    this.instance.updateMatrixWorld() // To be used in projection
  }

  updateFocusTargetSystem (delta) {
    if (!this.$vm.cameraTarget instanceof THREE.Vector3) {
      return
    }
  }

  updatePlayerFollowSystem(delta) {
    if (this.$vm.cameraTarget !== 'player') {
      return
    }

    const camera = this.instance
    const controlCamera = this.modes[this.mode].instance
    this.currentTarget.copy(this.player.targetPos)

    this.playerFollow.shakeTime += delta * this.playerFollow.shakeSpeed

    if (this.player.forceApplied) {
      this.playerFollow.speedZoomDistance = math.damp(
        this.playerFollow.speedZoomDistance,
        this.playerFollow.maxSpeedZoomDistance,
        this.playerFollow.speedZoomSpringIn,
        delta
      )
    } else {
      this.playerFollow.speedZoomDistance = math.damp(
        this.playerFollow.speedZoomDistance,
        this.playerFollow.minSpeedZoomDistance,
        this.playerFollow.speedZoomSpringOut,
        delta
      )
    }

    if (this.first) {
      this.playerFollow.currentDistance =
        this.userZoomDistance + this.playerFollow.speedZoomDistance
      this.first = false
    }

    // Follow Target
    const cameraZoomOut = this.$vm.isShowPanel
    const uiZoom = cameraZoomOut ? 2 : 0
    this.currentUIZoom = math.damp(this.currentUIZoom, uiZoom, 2, delta)
    this.playerFollow.currentDistance = math.damp(
      this.playerFollow.currentDistance,
      this.userZoomDistance +
        this.playerFollow.speedZoomDistance +
        this.currentUIZoom,
      this.playerFollow.distanceSpring,
      delta
    )

    camera.position.copy(this.currentTarget)
    camera.position.addScaledVector(
      this.offset,
      this.curPreset.zoom * this.playerFollow.currentDistance
    )
    this.playerFollow.currentTarget.copy(this.currentTarget)
    camera.lookAt(this.currentTarget)
    camera.position.add(controlCamera.position)
    camera.quaternion.copy(controlCamera.quaternion)

    // Camera shake
    const ampl = this.playerFollow.shake
    const shakeTime = this.playerFollow.shakeTime
    camera.position.x += this.random.noise3D(shakeTime, camera.position.y, camera.position.z) * ampl
    camera.position.y += this.random.noise3D(camera.position.x, shakeTime, camera.position.z) * ampl
    camera.position.z += this.random.noise3D(camera.position.x, camera.position.y, shakeTime) * ampl

    // Apply preset
    camera.fov = this.curPreset.fov
    camera.matrixAutoUpdate = false

    // Camera zoom
    let cameraZoom = controlCamera.zoom
    const minZoom = 0.85
    const maxZoom = 1.5
    const constantZoomFactor = 0.9
    const targetZoomAtAspect = 0.9
    const targetAspect = 1440 / 900
    const currentAspect = this.config.width / this.config.height
    const targetFactor = currentAspect / targetAspect
    cameraZoom += math.clamp(targetZoomAtAspect * targetFactor, minZoom, maxZoom) * constantZoomFactor
    camera.zoom = cameraZoom

    if (__DEBUG__) {
      controlCamera.updateMatrix()
      controlCamera.updateMatrixWorld()
    }
    camera.updateProjectionMatrix()
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix)
  }

  destroy() {
    this.modes.debug.orbitControls.destroy()
  }
}
