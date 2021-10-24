import * as THREE from 'three'

import vertexShader from '../shaders/env-water-plane.vert'
import fragmentShader from '../shaders/env-water-plane.frag'

export class EnvWaterPlaneObject extends THREE.Mesh {

  constructor(options) {
		super()

    options = Object.assign({
      planeSize: 1
    }, options)

    const repeat = {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    }
    const width = options.planeSize
    const height = options.planeSize
    const uvMat = new THREE.Matrix3();
    const texRepeat = 1024 / 60;
    const repeatX = 1 * texRepeat;
    const repeatY = (1.0 / (width / height)) * texRepeat * -1.0;
    uvMat.setUvTransform(0, 0, 1, 1, THREE.MathUtils.degToRad(-45), 0, 0);

    this.uniforms = {
      uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
      time: { value: 0 },
      uvTransform: {
        value: uvMat,
      },
      environmentSize: {
        value: new THREE.Vector2(width, height),
      },
      uvRepeatScale: { value: 1 },
      ...options.uniforms
    }

    this.geometry = new THREE.PlaneGeometry(width, height)
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        HAS_TRACE_MAP: true
      },
      side: THREE.DoubleSide
    })

    this.rotation.x = -Math.PI / 2
  }

}
