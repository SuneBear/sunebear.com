import * as THREE from 'three'
import EventEmitter from '../../engine/utils/event-emitter'

// Chapter is just sub-scene
export class Chapter extends EventEmitter {
  constructor({ sketch }) {
    super()

    this.sketch = sketch
    this.renderer = sketch.renderer
    this.camera = sketch.camera

    this.renderTarget = new THREE.WebGLMultisampleRenderTarget(
      this.sketch.sizes.width,
      this.sketch.sizes.height
    )
    this.scene = new THREE.Scene()
  }

  // Transition Hook
  async beforeEnter() {

  }

  async afterEntered() {

  }

  async beforeLeave() {

  }

  async afterLeaved() {

  }

  // Viewport
  resize() {

  }

  // Render Loop
  update(delta) {
  }
}
