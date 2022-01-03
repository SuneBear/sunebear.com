import { Chapter } from './base'

export class MainChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'main'
    this.renderTarget = this.sketch.renderer.module.postProcess.composer.renderTarget1
  }

}
