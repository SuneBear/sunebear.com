import * as THREE from 'three'
import Module from '../engine/module'

export default class Enviroment extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupScene()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0xffffff)
  }

  update() {

  }
}
