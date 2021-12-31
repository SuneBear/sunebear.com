import * as THREE from 'three'

import vertexShader from '../shaders/depth-fade.vert'
import fragmentShader from '../shaders/depth-fade.frag'

export function createDepthFadeMaterial(uniforms = {}, params = {}) {
  return new THREE.ShaderMaterial({
    wireframe: false,
    wireframeLinewidth: 2,
    transparent: true,
    flatShading: true,
    depthTest: true,
    depthWrite: false,
    // blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: {
        value: 0
      },

      uColor: {
        value: new THREE.Vector3(1, 1, 1)
      },
      uAlpha: {
        value: 0.5
      },

      uOriginPosition: {
        value: new THREE.Vector3(0, 0, 0)
      },
      uLimitDistance: {
        value: 5
      },

      uFluctuationFrequency: {
        value: 0.001
      },
      uFluctuationAmplitude: {
        value: 0.1
      },

      ...uniforms
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    ...params
  })
}

export class DepthFadeObject extends THREE.Object3D {
  constructor(options) {
    super()

    // Options
    this.geometry = options.geometry
    this.revealPosition = options.revealPosition
    this.color = options.color

    // Material
    this.material = createLineFrameMaterial(options)
  }
}
