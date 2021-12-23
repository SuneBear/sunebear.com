import * as THREE from 'three'
import EventEmitter from './utils/event-emitter'

// @TODO: Re-calculate heightSize, sizePixelsRatio, combine size with zoom
// @TODO: Support responsive unit
export default class Sizes extends EventEmitter {
  /**
   * Constructor
   */
  constructor(options = {}) {
    super()

    this.options = options
    this.camera = options.camera

    // Viewport size
    this.viewport = {}
    this.$sizeViewport = document.createElement('div')
    this.$sizeViewport.style.width = '100%'
    this.$sizeViewport.style.height = '100%'
    this.$sizeViewport.style.position = 'absolute'
    this.$sizeViewport.style.top = 0
    this.$sizeViewport.style.left = 0
    this.$sizeViewport.style.pointerEvents = 'none'

    // Resize event
    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)

    this.resize()
  }

  /**
   * Resize
   */
  resize() {
    const { onResize } = this.options
    const container = this.options.container || document.body

    container.appendChild(this.$sizeViewport)
    this.viewport.width = this.$sizeViewport.offsetWidth || window.innerWidth
    this.viewport.height = this.$sizeViewport.offsetHeight || window.innerHeight
    container.removeChild(this.$sizeViewport)

    this.width = this.viewport.width
    this.height = this.viewport.height

    this.updateViewportSize()

    onResize && onResize()

    this.trigger('resize')
  }

  // Unitless dimentsion
  updateViewportSize() {
    const { camera } = this

    if (camera) {
      const fovRad = (camera.fov * Math.PI) / 180
      this.viewport.heightSize =
        2 * Math.tan(fovRad / 2) * camera.position.length() / camera.zoom
      this.viewport.widthSize = this.viewport.heightSize * camera.aspect
      this.viewport.sizePixelsRatio = this.width / this.viewport.widthSize
    }
  }

  getObjectUnitlessDimension(object) {
    const { camera } = this

    if (!camera) {
      console.warn('[sizes] camera is invalid')
    }

    const fovRad = (camera.fov * Math.PI) / 180
    const cameraTempPos = camera.position.clone()
    cameraTempPos.x = object.position.x
    const dist = camera.position.distanceTo(object.position)
    const heightSize = 2 * Math.tan(fovRad / 2) * dist / camera.zoom
    const widthSize = heightSize * camera.aspect
    const sizePixelsRatio = this.width / widthSize

    return {
      heightSize,
      widthSize,
      sizePixelsRatio
    }
  }

  getObjectWorldSize(object) {
    const size = new THREE.Vector3()
    const box = new THREE.Box3().setFromObject(object)
    box.getSize(size)
    return size
  }

  // unitless size -> pixel
  getObjectScreenPosition(object) {
    const { camera } = this

    if (!camera) {
      console.warn('[sizes] camera is invalid')
    }

    const size = new THREE.Vector3()
    object.getWorldPosition(size)
    size.project(camera)

    return {
      x: (size.x * 0.5 + 0.5) * this.viewport.width,
      y: (size.y * -0.5 + 0.5) * this.viewport.height
    }
  }

  // unitless size -> pixel
  // @FIXME: Correct dimension
  getObjectScreenDimension(object) {
    const { camera } = this

    if (!camera) {
      console.warn('[sizes] camera is invalid')
    }

    const size = this.getObjectWorldSize(object)
    const unitlessSize = this.getObjectUnitlessDimension(object)

    size.x = size.x * unitlessSize.sizePixelsRatio
    size.y = size.y * unitlessSize.sizePixelsRatio

    return {
      width: size.x,
      height: size.y
    }
  }

  getObjectScaleByWidth(object, newWidth) {
    const { width } = this.getObjectScreenDimension(object)

    if (typeof newWidth === 'undefined') {
      console.warn('[sizes] getObjectScaleByWidth: newWidth was undefined')
    }

    return newWidth / width
  }

  setObjectScaleByWidth(object, newWidth) {
    const scale = this.getObjectScaleByWidth(object, newWidth)
    object.scale.multiplyScalar(scale)
  }
}
