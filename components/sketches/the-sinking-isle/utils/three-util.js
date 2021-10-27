import * as THREE from 'three'
import { spliceOne } from './array'

const _addedEvent = { type: 'added' }
const _removedEvent = { type: 'removed' }

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
  Object.keys(userData).forEach(k => {
    if (k.startsWith('_')) {
      delete userData[k]
    } else if (k === 'name' && userData.name === obj.name) {
      delete userData[k]
    }
  })
}

export function setPointsToBufferPosition(geometry, points) {
  const vertices = points
    .map(p => {
      if (Array.isArray(p)) return p
      return p.toArray()
    })
    .flat()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  )
}
