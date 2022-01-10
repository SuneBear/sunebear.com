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
    this.controls.enabled = __DEBUG__
  }

  beforeLeave() {
    this.controls.enabled = false
  }

}
