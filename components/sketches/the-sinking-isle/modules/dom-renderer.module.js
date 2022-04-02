import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import Module from './base'

// Like sprite object renderer, but for Vue
// @TODO: Support CSS2DObject frustum culling
export default class DOMRenderer extends Module {

  constructor(sketch) {
    super(sketch)

    this.instance = new CSS2DRenderer({
      element: this.$vm.$refs.domRenderer
    })
  }

  resize() {
    const { width, height } = this.sizes
    this.instance.setSize(width, height)
  }

  update(delta) {
    // this.instance.render(this.scene, this.camera)
  }

}
