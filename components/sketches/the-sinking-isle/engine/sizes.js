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
    const { camera } = this
    const container = this.options.container || document.body

    container.appendChild(this.$sizeViewport)
    this.viewport.width = this.$sizeViewport.offsetWidth
    this.viewport.height = this.$sizeViewport.offsetHeight
    container.removeChild(this.$sizeViewport)

    this.width = this.viewport.width
    this.height = this.viewport.height

    // Unitless dimentsion
    if (camera) {
      const fovRad = (camera.fov * Math.PI) / 180
      this.viewport.heightSize =
        2 * Math.tan(fovRad / 2) * camera.position.length()
      this.viewport.widthSize = this.viewport.heightSize * camera.aspect
      this.viewport.sizePixelsRatio = this.width / this.viewport.widthSize / 3
    }

    onResize && onResize()

    this.trigger('resize')
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
    // size.project(camera)

    size.x = size.x * this.viewport.sizePixelsRatio
    size.y = size.y * this.viewport.sizePixelsRatio

    return {
      width: size.x,
      height: size.y
    }
  }
}
