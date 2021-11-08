import * as THREE from 'three'

// @Source: https://github.com/maximeq/three-js-capsule-geometry/blob/master/src/CapsuleBufferGeometry.js

/**
 * @author maximequiblier
 */
function CapsuleBufferGeometry(
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  heightSegments,
  capsTopSegments,
  capsBottomSegments,
  thetaStart,
  thetaLength
) {
  Object.assign(this, new THREE.BufferGeometry())

  this.type = 'CapsuleBufferGeometry'

  this.parameters = {
    radiusTop: radiusTop,
    radiusBottom: radiusBottom,
    height: height,
    radialSegments: radialSegments,
    heightSegments: heightSegments,
    thetaStart: thetaStart,
    thetaLength: thetaLength
  }

  var scope = this

  radiusTop = radiusTop !== undefined ? radiusTop : 1
  radiusBottom = radiusBottom !== undefined ? radiusBottom : 1
  height = height !== undefined ? height : 2

  radialSegments = Math.floor(radialSegments) || 8
  heightSegments = Math.floor(heightSegments) || 1
  capsTopSegments = Math.floor(capsTopSegments) || 2
  capsBottomSegments = Math.floor(capsBottomSegments) || 2

  thetaStart = thetaStart !== undefined ? thetaStart : 0.0
  thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI

  // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
  var alpha = Math.acos((radiusBottom - radiusTop) / height)
  var eqRadii = radiusTop - radiusBottom === 0

  var vertexCount = calculateVertexCount()
  var indexCount = calculateIndexCount()

  // buffers
  var indices = new THREE.BufferAttribute(
    new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount),
    1
  )
  var vertices = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3)
  var normals = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3)
  var uvs = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2)

  // helper variables

  var index = 0,
    indexOffset = 0,
    indexArray = [],
    halfHeight = height / 2

  // generate geometry

  generateTorso()

  // build geometry

  this.setIndex(indices)
  this.setAttribute('position', vertices)
  this.setAttribute('normal', normals)
  this.setAttribute('uv', uvs)

  // helper functions

  function calculateVertexCount() {
    var count =
      (radialSegments + 1) *
      (heightSegments + 1 + capsBottomSegments + capsTopSegments)
    return count
  }

  function calculateIndexCount() {
    var count =
      radialSegments *
      (heightSegments + capsBottomSegments + capsTopSegments) *
      2 *
      3
    return count
  }

  function generateTorso() {
    var x, y
    var normal = new THREE.Vector3()
    var vertex = new THREE.Vector3()

    var cosAlpha = Math.cos(alpha)
    var sinAlpha = Math.sin(alpha)

    var cone_length = new THREE.Vector2(
      radiusTop * sinAlpha,
      halfHeight + radiusTop * cosAlpha
    )
      .sub(
        new THREE.Vector2(
          radiusBottom * sinAlpha,
          -halfHeight + radiusBottom * cosAlpha
        )
      )
      .length()

    // Total length for v texture coord
    var vl =
      radiusTop * alpha + cone_length + radiusBottom * (Math.PI / 2 - alpha)

    var groupCount = 0

    // generate vertices, normals and uvs

    var v = 0
    for (y = 0; y <= capsTopSegments; y++) {
      var indexRow = []

      var a = Math.PI / 2 - alpha * (y / capsTopSegments)

      v += (radiusTop * alpha) / capsTopSegments

      var cosA = Math.cos(a)
      var sinA = Math.sin(a)

      // calculate the radius of the current row
      var radius = cosA * radiusTop

      for (x = 0; x <= radialSegments; x++) {
        var u = x / radialSegments

        var theta = u * thetaLength + thetaStart

        var sinTheta = Math.sin(theta)
        var cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y = halfHeight + sinA * radiusTop
        vertex.z = radius * cosTheta
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
        normals.setXYZ(index, normal.x, normal.y, normal.z)

        // uv
        uvs.setXY(index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(index)

        // increase index
        index++
      }

      // now save vertices of the row in our index array
      indexArray.push(indexRow)
    }

    var cone_height = height + cosAlpha * radiusTop - cosAlpha * radiusBottom
    var slope = (sinAlpha * (radiusBottom - radiusTop)) / cone_height
    for (y = 1; y <= heightSegments; y++) {
      var indexRow = []

      v += cone_length / heightSegments

      // calculate the radius of the current row
      var radius =
        sinAlpha *
        ((y * (radiusBottom - radiusTop)) / heightSegments + radiusTop)

      for (x = 0; x <= radialSegments; x++) {
        var u = x / radialSegments

        var theta = u * thetaLength + thetaStart

        var sinTheta = Math.sin(theta)
        var cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y =
          halfHeight + cosAlpha * radiusTop - (y * cone_height) / heightSegments
        vertex.z = radius * cosTheta
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(sinTheta, slope, cosTheta).normalize()
        normals.setXYZ(index, normal.x, normal.y, normal.z)

        // uv
        uvs.setXY(index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(index)

        // increase index
        index++
      }

      // now save vertices of the row in our index array
      indexArray.push(indexRow)
    }

    for (y = 1; y <= capsBottomSegments; y++) {
      var indexRow = []

      var a = Math.PI / 2 - alpha - (Math.PI - alpha) * (y / capsBottomSegments)

      v += (radiusBottom * alpha) / capsBottomSegments

      var cosA = Math.cos(a)
      var sinA = Math.sin(a)

      // calculate the radius of the current row
      var radius = cosA * radiusBottom

      for (x = 0; x <= radialSegments; x++) {
        var u = x / radialSegments

        var theta = u * thetaLength + thetaStart

        var sinTheta = Math.sin(theta)
        var cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y = -halfHeight + sinA * radiusBottom
        vertex.z = radius * cosTheta
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
        normals.setXYZ(index, normal.x, normal.y, normal.z)

        // uv
        uvs.setXY(index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(index)

        // increase index
        index++
      }

      // now save vertices of the row in our index array
      indexArray.push(indexRow)
    }

    // generate indices

    for (x = 0; x < radialSegments; x++) {
      for (
        y = 0;
        y < capsTopSegments + heightSegments + capsBottomSegments;
        y++
      ) {
        // we use the index array to access the correct indices
        var i1 = indexArray[y][x]
        var i2 = indexArray[y + 1][x]
        var i3 = indexArray[y + 1][x + 1]
        var i4 = indexArray[y][x + 1]

        // face one
        indices.setX(indexOffset, i1)
        indexOffset++
        indices.setX(indexOffset, i2)
        indexOffset++
        indices.setX(indexOffset, i4)
        indexOffset++

        // face two
        indices.setX(indexOffset, i2)
        indexOffset++
        indices.setX(indexOffset, i3)
        indexOffset++
        indices.setX(indexOffset, i4)
        indexOffset++
      }
    }
  }
}

CapsuleBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype)
CapsuleBufferGeometry.prototype.constructor = CapsuleBufferGeometry

export default CapsuleBufferGeometry
