import * as THREE from 'three'

import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/fbm-bubble-plane.frag'

export class FBMBubblePlaneObject extends THREE.Mesh {

  constructor(options) {
    super()

    options = Object.assign(
      {
        size: 2,
        samplerTexture: null
      },
      options
    )

    this.uniforms = {
      uTime: { type: "float", value: 0 },
      uProgress: { type: "float", value: 0 },
      uResolution: { type: "vec2", value: [window.innerWidth, window.innerHeight] },

      octaves: { type: "int", value: 2 },
      uContrast: { type: "float", value: -.6 },
      uBrightness: { type: "float", value: .3 },
      uSize: { type: "float", value: 1.4 },
      uSpeed: { type: "vec3", value: [.059, .01, .03] },
      uDiffuse0: { type: "vec3", value: new THREE.Color(0x8bbadc) },
      uDiffuse1: { type: "vec3", value: new THREE.Color(0xb3ff) },
      uDiffuse2: { type: "vec3", value: new THREE.Color(0xb90000) },
      uOpacity: { type: "float", value: .5 },

      uSampler: { type: "sampler2D", value: options.samplerTexture }
    }

    this.geometry = new THREE.PlaneBufferGeometry(options.size, options.size)

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true
    })
  }

  resize(width, height) {
    this.uniforms.uResolution.value.x = width
    this.uniforms.uResolution.value.y = height
  }

}
