import * as THREE from 'three'

import vertexShader from '../shaders/mesh-sprite.vert'
import fragmentShader from '../shaders/mesh-sprite.frag'

const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
planeGeo.translate(0, 0.5, 0)

function createSpriteMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    extensions: {
      derivatives: true
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    fragmentShader,
    vertexShader,
    uniforms: {
      shadowColor: { value: new THREE.Color('#280422') },
      map: { value: null },
      flip: { value: 1 },
      silhouette: { value: false, type: 'b' },
      useMapDiscard: { value: false, type: 'b' },
      color: { value: new THREE.Color('white') },
      time: { value: 0 },
      spin: { value: 0 },
      spriteHeight: { value: 1 },
      aspect: { value: 1 },
      repeat: { value: new THREE.Vector2(1, 1) },
      offset: { value: new THREE.Vector2(0, 0) },
      tintColor: { value: new THREE.Color('#ffffff') },
      ...uniforms
    }
  })
}

function setSpriteData({ object, map, uniforms, flipX = false }) {
  if (!map) {
    map =
      object.material.uniforms && object.material.uniforms.map
        ? object.material.uniforms.map.value
        : object.material.map
  }

  const aspect = map && map.image ? map.image.width / map.image.height : 1

  object.userData.type = 'meshSprite'
  object.geometry = planeGeo
  object.material = createSpriteMaterial(uniforms)

  if (map) {
    object.material.uniforms.map.value = map
    object.material.uniforms.repeat.value.copy(map.repeat)
    object.material.uniforms.offset.value.copy(map.offset)
  }

  object.material.uniforms.flip.value = flipX ? -1 : 1
  object.material.side = flipX ? THREE.BackSide : THREE.FrontSide
  object.material.uniforms.useMapDiscard.value = false

  object.material.uniforms.aspect.value = aspect
  object.material.uniforms.spriteHeight.value = object.scale.y

  return object
}

export function convertToMeshSprite(options) {
  return setSpriteData(options)
}

export class MeshSpriteObject extends THREE.Mesh {
  constructor({ map, spriteData, uniforms = {} } = {}) {
    super()

    this.geometry = planeGeo
    this.material = createSpriteMaterial(uniforms)

    this.userData.type = 'meshSprite'

    if (map) {
      this.material.uniforms.map.value = map
    }
  }
}
