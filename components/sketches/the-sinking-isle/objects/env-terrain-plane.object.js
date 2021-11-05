import * as THREE from 'three'

import vertexShader from '../shaders/env-terrain-plane.vert'
import fragmentShader from '../shaders/env-terrain-plane.frag'

function getImageData(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  var context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

export class EnvTerrainPlaneObject extends THREE.Mesh {
  constructor(options) {
    super()

    options = Object.assign(
      {
        planeSize: 1,
        heightMapTexture: new THREE.Texture()
      },
      options
    )

    const hightMapData = getImageData(options.heightMapTexture.image)
    const width = options.planeSize
    const height = options.planeSize
    const uvMat = new THREE.Matrix3()
    const texRepeat = 1024 / 60
    const repeatX = 1 * texRepeat
    const repeatY = (1.0 / (width / height)) * texRepeat * -1.0
    uvMat.setUvTransform(0, 0, 1, 1, THREE.MathUtils.degToRad(-45), 0, 0)

    this.uniforms = {
      time: { value: 0 },
      heightMap: { value: options.heightMapTexture },
      floorMap: { value: null },
      floorPathMap: { value: null },
      floorOverlayMap: { value: null },
      originColor: { value: new THREE.Color("#969492") },
      floorColor: { value: new THREE.Color(0x808080) },
      clearColor: { value: new THREE.Color("#130904") },
      overlayOpacity: { value: 0.3 },
      uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
      uvRepeatScale: { value: 2 },
      uvTransform: {
        value: uvMat
      },
      environmentSize: {
        value: new THREE.Vector2(width, height)
      },
      ...options.uniforms
    }

    this.geometry = options.terrainGeo

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        HAS_TRACE_MAP: true
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    })

    this.scale.set(width / 2, 1, height / 2)
    this.position.y = -0.1
    // this.rotation.x = -Math.PI / 2
  }
}
