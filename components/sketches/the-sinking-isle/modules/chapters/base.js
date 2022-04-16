import * as THREE from 'three'
import { __DEBUG__ } from '~/utils/dev'
import EventEmitter from '../../engine/utils/event-emitter'

// Chapter is just sub-scene
export class Chapter extends EventEmitter {
  constructor({ sketch }) {
    super()

    this.name = 'default'

    this.sketch = sketch
    this.$vm = this.sketch.$vm
    this.renderer = sketch.renderer
    this.domRenderer = sketch.domRenderer
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
    this.controls && (this.controls.enabled = true || __DEBUG__)
    this.hideCSS2DObject()
  }

  async afterEntered() {
    this.showCSS2DObject()
  }

  async beforeLeave() {
    this.controls && (this.controls.enabled = false)
  }

  async afterLeft() {
    this.hideCSS2DObject()
  }

  showCSS2DObject() {
    // Re-display dom renderer
    this.scene.traverse((object) => {
      if (object.isCSS2DObject) {
        if (object.userData.lastVisible !== undefined) {
          object.visible = object.userData.lastVisible
        }
      }
    })
  }

  hideCSS2DObject() {
    // @hack: hide dom renderer
    this.scene.traverse((object) => {
      if (object.isCSS2DObject && object.visible) {
        object.userData.lastVisible = object.visible
        object.visible = false
      }
    })
    // @forceUpdate domRenderer
    this.updateDomRenderer()
  }

  // Viewport
  resize() {
    this.camera.aspect = this.sketch.sizes.width / this.sketch.sizes.height
    this.camera.updateProjectionMatrix()
  }

  pureRender() {
    const { renderer } = this
    renderer.setRenderTarget(this.renderTarget)
    renderer.clear()
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }

  updateDomRenderer() {
    this.domRenderer.render(this.scene, this.camera)
  }

  // Render Loop
  update(delta) {
    this.updateDomRenderer()
  }
}
