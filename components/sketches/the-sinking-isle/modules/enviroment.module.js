import * as THREE from 'three'
import Module from '../engine/module'

import { EnvWaterPlaneObject } from '../objects/env-water-plane.object'

export default class Enviroment extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupScene()
    this.setupWater()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0xffffff)
  }

  setupWater() {
    this.water = new EnvWaterPlaneObject({
      planeSize: this.config.worldSize,
      uniforms: this.enviromentTrace.getTraceUniforms()
    })
    this.scene.add(this.water)
  }

  update(delta, elapsed) {
    this.water.uniforms.time.value = elapsed
  }
}
