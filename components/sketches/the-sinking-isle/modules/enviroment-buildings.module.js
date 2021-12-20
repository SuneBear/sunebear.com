import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'

export default class EnviromentBuildings extends Module {

  constructor(sketch) {
    super(sketch)
    const random = Random(true, 'Buildings')
    const group = new THREE.Group()
    group.name = 'envBuildings'
    this.scene.add(group)

    this.setupSuneBearHome()
  }

  setupSuneBearHome() {

  }

  setupSnowfallSpace() {

  }

  setupBeacon() {

  }

  setupSunkBuildings() {

  }

  update(delta) {
  }

}
