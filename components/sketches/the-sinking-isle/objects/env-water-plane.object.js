import * as THREE from 'three'
import earcut from 'earcut'
import { math } from '~/utils/math'

import vertexShader from '../shaders/env-plane.vert'
import fragmentShader from '../shaders/env-water-plane.frag'

export class EnvWaterPlaneObject extends THREE.Mesh {
  constructor(options) {
    super()

    options = Object.assign(
      {
        hasIce: true,
        lakeInfo: null,
        planeSize: 1
      },
      options
    )

    const lakeInfo = options.lakeInfo
    const width = options.planeSize
    const height = options.planeSize
    const uvMat = new THREE.Matrix3()
    const texRepeat = 1024 / 60
    const repeatX = 1 * texRepeat
    const repeatY = (1.0 / (width / height)) * texRepeat * -1.0
    uvMat.setUvTransform(0, 0, 1, 1, THREE.MathUtils.degToRad(-45), 0, 0)

    this.uniforms = {
      time: { value: 0 },
      isMask: { value: false },
      causticsMap: { value: null },
      waterColor: { value: null },
      waterOpacity: { value: 0.7 },
      centroidPosition: { value: new THREE.Vector3(0, 0, 0) },
      lakeSize: { value: width / 2 },
      colorA: { value: new THREE.Color(options.hasIce ? "#698193" : "#163d84") },
      colorB: { value: new THREE.Color(options.hasIce ? "#a8bec4" : "#49c2ff") },
      environmentSize: {
        value: new THREE.Vector2(width, height)
      },
      uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
      uvRepeatScale: { value: 1 },
      uvTransform: {
        value: uvMat
      },
      ...options.uniforms
    }

    if (lakeInfo) {
      this.generateGeoByLakeInfo(lakeInfo, width, height)
      this.renderOrder = -1
      this.position.y = 0.05
    } else {
      this.geometry = new THREE.PlaneGeometry(width, height, width, height)
      this.rotation.x = -Math.PI / 2
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        WATER: !options.hasIce,
        HAS_GROUND_MAP: true,
        HAS_TRACE_MAP: true,
        HAS_ANGLE: true,
        HAS_SURF_UV: true
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    })
  }

  generateGeoByLakeInfo(lakeInfo, width, height) {
    const { polygon, centroid, bounds } = lakeInfo

    const [min, max] = bounds
    const w = max[0] - min[0]
    const h = max[1] - min[1]
    const lakeSize = Math.sqrt(w * w + h * h) / 2
    const verts = polygon.flat(Infinity)
    const cells = earcut(verts, [], 2)
    const geom = new THREE.BufferGeometry()
    const uvs = []
    const verts3D = []
    const angles = []
    const surfUVs = []
    polygon.map((p, i, list) => {
      angles.push((i / (list.length - 1)) * Math.PI * 2)
      verts3D.push(p[0], 0, p[1])
      const u = math.inverseLerp(-width / 2, width / 2, p[0])
      const v = math.inverseLerp(height / 2, -height / 2, p[1])
      uvs.push(u, v)

      const su = math.inverseLerp(min[0], max[0], p[0])
      const sv = math.inverseLerp(min[1], max[1], p[1])
      surfUVs.push(su, sv)
    })
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts3D, 3))
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geom.setAttribute('surfUv', new THREE.Float32BufferAttribute(surfUVs, 2))
    geom.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))
    geom.setIndex(new THREE.Uint16BufferAttribute(cells, 1))

    this.geometry = geom

    this.uniforms.lakeSize.value = lakeSize
    this.uniforms.centroidPosition.value =  new THREE.Vector3(centroid[0], 0, centroid[1])
  }
}
