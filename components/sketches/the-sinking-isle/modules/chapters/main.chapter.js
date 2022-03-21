import { __DEBUG__ } from '~/utils/dev'
import { Chapter } from './base'

export class MainChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'main'
    this.renderTarget = this.renderer.module.postProcess.composer.renderTarget1
    this.controls = this.sketch.camera.module.modes.debug.orbitControls
  }

  beforeEnter() {
    this.controls && (this.controls.enabled = __DEBUG__)
  }

  afterEntered() {
    // Re-display dom renderer
    this.sketch.scene.traverse((object) => {
      if (object.isCSS2DObject) {
        object.visible = object.userData.lastVisible
      }
    })
  }

  beforeLeave() {
    this.controls && (this.controls.enabled = false)

    // @hack: hide dom renderer
    this.sketch.scene.traverse((object) => {
      if (object.isCSS2DObject) {
        object.userData.lastVisible = object.visible
        object.visible = false
      }
    })
  }
}
