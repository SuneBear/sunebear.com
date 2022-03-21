import * as THREE from 'three'
import EventEmitter from '../../engine/utils/event-emitter'

// Chapter is just sub-scene
export class Chapter extends EventEmitter {
  constructor({ sketch }) {
    super()

    this.sketch = sketch
    this.renderer = sketch.renderer
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(30, sketch.sizes.width / sketch.sizes.height, 4)

    this.renderTarget = new THREE.WebGLRenderTarget(
      sketch.sizes.width,
      sketch.sizes.height
    )
    this.renderTarget.samples = 4
  }

  // Transition Hook
  async beforeEnter() {

  }

  async afterEntered() {

  }

  async beforeLeave() {

  }

  async afterLeft() {

  }

  // Viewport
  resize() {
    this.camera.aspect = this.sketch.sizes.width / this.sketch.sizes.height
    this.camera.updateProjectionMatrix()
  }

  // Render Loop
  update(delta) {
  }
}
