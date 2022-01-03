import * as THREE from 'three'
import { Chapter } from './base'

export class SuneBearHomeChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'suneBearHome'

    this.setupRender()
  }

  setupRender() {
    this.scene.background = new THREE.Color(0xe59e7a)
  }

  update() {
    this.updateRender()
  }

  updateRender() {
    const { renderer } = this
    renderer.setRenderTarget(this.renderTarget)
    renderer.clear()
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }

}
