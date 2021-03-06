import * as THREE from 'three'
import { spliceOne } from './array'

const _addedEvent = { type: 'added' }
const _removedEvent = { type: 'removed' }
const axis = new THREE.Vector3()

export function detachObject(object) {
  if (object.parent) {
    removeFromObject(object.parent, object)
  }
}

export function addObject(object, child) {
  detachObject(child)
  child.parent = object
  object.children.push(child)
  object.dispatchEvent(_addedEvent)
}

export function removeFromObject(object, child) {
  const idx = object.children.indexOf(child)
  if (idx >= 0) {
    spliceOne(object.children, idx)
    child.parent = null
    child.dispatchEvent(_removedEvent)
  }
}

export function removeFromArray(array, index) {
  const child = array[index]
  if (child) {
    spliceOne(array, index)
    detachObject(child)
  }
}

export function clearGroup(g) {
  for (let i = 0; i < g.children.length; i++) {
    const child = g.children[i]
    child.parent = null
    child.dispatchEvent(_removedEvent)
  }
  g.children.length = 0
}

export function pruneUserData(obj) {
  const userData = obj.userData
  Object.keys(userData).forEach((k) => {
    if (k.startsWith('_')) {
      delete userData[k]
    } else if (k === 'name' && userData.name === obj.name) {
      delete userData[k]
    }
  })
}

export function shareAtlasTexture(renderer, atlasTexture, spriteTexture) {
  if (atlasTexture.image && spriteTexture.__hasFixedTexture !== atlasTexture) {
    spriteTexture.__hasFixedTexture = atlasTexture
    const atlas = renderer.properties.get(atlasTexture)
    if (!atlas.__webglTexture) {
      renderer.initTexture(atlasTexture)
    }
    const data = renderer.properties.get(spriteTexture)
    Object.assign(data, atlas)
  }
}

// @Source: https://github.com/mattdesl/three-quaternion-from-normal
export function quaternionFromNormal(normal, quaternion) {
  quaternion = quaternion || new THREE.Quaternion()
  // vector is assumed to be normalized
  if (normal.y > 0.99999) {
    quaternion.set(0, 0, 0, 1)
  } else if (normal.y < -0.99999) {
    quaternion.set(1, 0, 0, 0)
  } else {
    axis.set(normal.z, 0, -normal.x).normalize()
    const radians = Math.acos(normal.y)
    quaternion.setFromAxisAngle(axis, radians)
  }
  return quaternion
}

export function setPointsToBufferPosition(geometry, points) {
  const vertices = points
    .map((p) => {
      if (Array.isArray(p)) return p
      return p.toArray()
    })
    .flat()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  )
}

export const cloneMaterial = (object) => {
  const c = object
  const oldMat = c.material
  c.material = oldMat.clone()
  c.material.uniforms = Object.assign({}, oldMat.uniforms)
  for (let p in oldMat.uniforms) {
    const oldV = oldMat.uniforms[p].value
    if (
      oldV.isColor ||
      oldV.isMatrix3 ||
      oldV.isMatrix4 ||
      oldV.isVector2 ||
      oldV.isVector3 ||
      oldV.isVector4
    ) {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV.clone(),
      })
    } else if (Array.isArray(oldV)) {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV.slice(),
      })
    } else {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV,
      })
    }
  }
}
