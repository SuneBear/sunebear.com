import * as THREE from 'three'

// import vertexShader from '../shaders/env-terrain-plane.vert'
import vertexShader from '../shaders/env-plane.vert'
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
        hasIce: true,
        planeSize: 1,
        planeScale: 1,
        heightMapTexture: new THREE.Texture()
      },
      options
    )

    // const hightMapData = getImageData(options.heightMapTexture.image)
    const width = options.planeSize * options.planeScale
    const height = options.planeSize * options.planeScale
    const uvMat = new THREE.Matrix3()
    const texRepeat = 1024 / 120
    const repeatX = 1 * texRepeat
    const repeatY = (1.0 / (width / height)) * texRepeat * -1.0
    uvMat.setUvTransform(0, 0, 1, 1, THREE.MathUtils.degToRad(-45), 0, 0)

    this.name = 'ground'
    this.uniforms = {
      time: { value: 0 },
      heightMap: { value: options.heightMapTexture },
      floorMap: { value: null },
      floorPathMap: { value: null },
      floorOverlayMap: { value: null },
      originColor: { value: new THREE.Color("#969492") },
      floorColor: { value: new THREE.Color(0x808080) },
      clearColor: { value: new THREE.Color("#383838") },
      overlayOpacity: { value: 0.3 },
      planeScale: { value: options.planeScale },
      hasIce: { value: options.hasIce },
      isRenderTarget: { value: false },
      uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
      uvRepeatScale: { value: 1 },
      uvTransform: {
        value: uvMat
      },
      environmentSize: {
        value: new THREE.Vector2(width, height)
      },
      ...options.uniforms
    }

    // this.geometry = options.terrainGeo
    this.geometry = new THREE.PlaneGeometry(width, height, 1, 1)

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

    this.position.y = 0.01
    this.rotation.x = -Math.PI / 2
  }
}
