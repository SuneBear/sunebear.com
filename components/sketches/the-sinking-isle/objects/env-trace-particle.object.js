import * as THREE from 'three'

import vertexShader from '../shaders/env-trace-particle.vert'
import fragmentShader from '../shaders/env-trace-particle.frag'

export class EnvTracePrticleObject extends THREE.Sprite {

  constructor(options) {
		super()

    this.uniforms = {
      color: { value: new THREE.Color() },
      map: { value: options.map },
      opacity: { value: 0.0 }
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
  }

}
