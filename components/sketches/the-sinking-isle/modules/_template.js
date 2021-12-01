import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'

export default class TemplateModule extends Module {

  constructor(sketch) {
    super(sketch)
    const random = Random(true, '_template')
    const group = new THREE.Group()
    group.name = '_template'
    this.scene.add(group)
  }

  update(delta) {
  }

}
