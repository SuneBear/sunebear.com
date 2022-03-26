import * as THREE from 'three'
import { RENDER_LAYERS } from '../utils/constants'
import throttle from 'lodash.throttle'

export class SceneObjectInteractionSystem {

  constructor({
    scene,
    camera,
    control,
  }) {
    this.scene = scene
    this.camera = camera
    this.control = control

    this.namespace = Date.now()
    this.raycaster = new THREE.Raycaster()
    this.intersects = []

    this.raycaster.layers.set(RENDER_LAYERS.HANDLER)

    this.bindEvents()
    this.play()
  }

  bindEvents() {
    const isInteractObject = (obj) => {
      return obj.onPointerOver || obj.onPointerOut || obj.onClick
    }

    const getIntersects = () => {
      const mouse = this.control.getMouse()
      this.raycaster.setFromCamera(mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.scene.children, true)

      if (
        (this.intersects.length && !intersects.length) ||
        (this.intersects.length && this.intersects[0].object.id !== intersects[0].object.id)
      ) {
        this.intersects.map(el => {
          el.object.userData.onPointerOver = false
          el.object.onPointerOut && el.object.onPointerOut(this.control.cursor)
        })
      }

      this.intersects = intersects
        .filter((el) => el.object && isInteractObject(el.object))
        // .slice(0, 1)
    }

    this.scene.traverse(child => {
      if (isInteractObject(child)) {
        this.raycaster.layers.enable(RENDER_LAYERS.HANDLER)
      }
    })

    // @TODO: Throttle the event
    this.control.on(`mousemove.${this.namespace}`, throttle(() => {
      if (!this.isListening) {
        return
      }
      getIntersects()
      this.updateCursorStyle()
      this.intersects.map((el) => {
        if (!el.object.userData.onPointerOver && el.object.onPointerOver) {
          el.object.userData.onPointerOver = true
          el.object.onPointerOver(this.control.cursor)
        }
      })
    }, 100))

    this.control.on('tap.${this.namespace}', () => {
      if (!this.isListening) {
        return
      }
      // getIntersects()
      this.intersects.map(el => {
        if (el.object.onClick) {
          el.object.onClick(this.control.cursor)
        }
      })
    })
  }

  updateCursorStyle() {
    this.control.$canvas.classList.toggle('handler', this.intersects.length)
  }

  play() {
    this.isListening = true
  }

  pause(){
    this.isListening = false
    this.intersects = []
    this.updateCursorStyle()
  }

}
