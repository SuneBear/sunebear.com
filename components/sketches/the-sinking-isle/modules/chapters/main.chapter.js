import { Chapter } from './base'

export class MainChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'main'
    this.scene = this.sketch.scene
    this.camera = this.sketch.camera
    this.renderTarget = this.renderer.module.postProcess.composer.renderTarget1
    this.controls = this.sketch.camera.module.modes.debug.orbitControls
  }

}
