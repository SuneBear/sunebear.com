import * as THREE from 'three'
import { RENDER_LAYERS } from '../utils/constants'

import vertexShader from '../shaders/line-3d.vert'
import fragmentShader from '../shaders/line-3d.frag'

const tmpPos3D = new THREE.Vector3()
const tmpPos3DB = new THREE.Vector3()
const tmpArray3 = [0, 0, 0]

function getTempPosition(vertex, withData, isVector) {
  vertex = withData ? vertex.position : vertex
  if (isVector) {
    tmpArray3[0] = vertex.x
    tmpArray3[1] = vertex.y
    tmpArray3[2] = vertex.z
    return tmpArray3
  } else {
    return vertex
  }
}

class LineGeometry extends THREE.BufferGeometry {
  updatePath(line, withData, isVector) {
    const vertexCount = line.length

    // TODO: interleave this data into a single buffer?
    const position = []
    const previousPosition = []
    const nextPosition = []
    const direction = []
    const vertexHasToken = []
    const vertexDistance = []
    let distSum = 0

    for (let i = 0; i < vertexCount; i++) {
      const item = line[i]
      let d = getTempPosition(item, withData, isVector)

      const tokenVal = 1
      // const tokenVal = d.token ? 1 : 0;
      // const dist = d.distance;

      const x = d[0]
      const y = d[1]
      const z = d[2]
      position.push(x, y, z, x, y, z)

      const pItem = i < 1 ? line[i] : line[i - 1]
      const pd = getTempPosition(pItem, withData, isVector)
      const px = pd[0]
      const py = pd[1]
      const pz = pd[2]
      previousPosition.push(px, py, pz, px, py, pz)

      let dist = 0
      if (i > 0) {
        tmpPos3D.set(x, y, z)
        distSum += tmpPos3D.distanceTo(tmpPos3DB)
        dist = distSum
      }
      tmpPos3DB.set(x, y, z)

      const nItem = i < line.length - 1 ? line[i + 1] : line[line.length - 1]
      const nd = getTempPosition(nItem, withData, isVector)
      const nx = nd[0]
      const ny = nd[1]
      const nz = nd[2]
      nextPosition.push(nx, ny, nz, nx, ny, nz)

      vertexHasToken.push(tokenVal, tokenVal)
      direction.push(-1, 1)

      const alpha = vertexCount <= 1 ? 0.5 : i / (vertexCount - 1)
      vertexDistance.push(alpha, dist, alpha, dist)
    }

    this.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
    this.setAttribute(
      'nextPosition',
      new THREE.Float32BufferAttribute(nextPosition, 3)
    )
    this.setAttribute(
      'previousPosition',
      new THREE.Float32BufferAttribute(previousPosition, 3)
    )
    this.setAttribute(
      'direction',
      new THREE.Float32BufferAttribute(direction, 1)
    )
    this.setAttribute(
      'vertexHasToken',
      new THREE.Float32BufferAttribute(vertexHasToken, 1)
    )
    this.setAttribute(
      'vertexDistance',
      new THREE.Float32BufferAttribute(vertexDistance, 2)
    )
    const indexUint16 =
      vertexCount >= 2 ? createIndices(vertexCount - 1) : new Uint16Array(0)

    this.setIndex(new THREE.BufferAttribute(indexUint16, 1))
    this.updateBounds()
    return distSum
  }

  updateBounds() {
    const pos = this.attributes.position
    if (!this.boundingBox) this.boundingBox = new THREE.Box3()
    if (!this.boundingSphere) this.boundingSphere = new THREE.Sphere()
    this.boundingBox.makeEmpty()
    for (let i = 0; i < pos.count; i += 2) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      tmpPos3D.set(x, y, z)
      this.boundingBox.expandByPoint(tmpPos3D)
    }
    const maxY = Math.max(this.boundingBox.min.y, this.boundingBox.max.y)
    this.boundingBox.min.y = 0
    this.boundingBox.max.y = maxY
    this.boundingBox.getBoundingSphere(this.boundingSphere)
  }
}

export class Line3D extends THREE.Group {
  constructor(opts = {}) {
    super()

    const {
      blending = THREE.NormalBlending,
      thickness = 0.5,
      opacity = 1,
      bloom = 1.5,
      draw = 1,
      geometry,
      depthWrite = true,
      depthTest = true
    } = opts

    this.name = 'line3D'

    const color = new THREE.Color(opts.color || 'white')
    color.r += bloom
    color.g += bloom
    color.b += bloom

    this.thickness = thickness
    this.geometry = geometry || new LineGeometry()
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      blending,
      depthTest,
      depthWrite,
      vertexShader,
      fragmentShader,
      extensions: {
        derivatives: true
      },
      uniforms: {
        dottedFill: { value: opts.dottedFill || 0 },
        dotted: { value: Boolean(opts.dotted), type: 'b' },
        opacity: { value: opacity },
        time: { value: 0 },
        color: {
          value: color
        },
        resolution: { value: new THREE.Vector2() },
        thickness: { value: this.thickness },
        miterLimit: { value: 8 },
        totalDistance: { value: 0 },
        taper: { value: opts.taper !== false, type: 'b' },
        draw: { value: draw },
        drawing: { value: Boolean(opts.false), type: 'b' },
        filling: { value: Boolean(opts.filling), type: 'b' },
        miter: { value: true, type: 'b' }
      }
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = true
    this.mesh.renderOrder = 10
    this.mesh.layers.enable(RENDER_LAYERS.BLOOM)
    this.add(this.mesh)
  }

  setAlpha(alpha) {
    this.material.uniforms.opacity.value = alpha
  }

  updateResolution(width, height) {
    this.material.uniforms.resolution.value.set(width, height)
  }

  updatePath(positions, withData, isVector) {
    const totalDist = this.geometry.updatePath(positions, withData, isVector)
    this.mesh.material.uniforms.totalDistance.value = totalDist
  }
}

// counter-clockwise indices but prepared for duplicate vertices
function createIndices(length) {
  let indices = new Uint16Array(length * 6)
  let c = 0
  let index = 0
  for (let j = 0; j < length; j++) {
    let i = index
    indices[c++] = i + 0
    indices[c++] = i + 1
    indices[c++] = i + 2
    indices[c++] = i + 2
    indices[c++] = i + 1
    indices[c++] = i + 3
    index += 2
  }
  return indices
}
