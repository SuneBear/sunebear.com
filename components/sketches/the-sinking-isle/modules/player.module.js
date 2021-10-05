import * as THREE from 'three'
import Module from '../engine/module'

export default class Player extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupInstance()
  }

  setupInstance() {
    this.instacne = new THREE.Group({
      name: 'player'
    })
  }

  update() {

  }
}
