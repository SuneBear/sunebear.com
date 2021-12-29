import * as THREE from 'three'
import { asset } from '../engine/asset'
import { RENDER_LAYERS } from '../utils/constants'

import vertexShader from '../shaders/mesh-toon.vert'
import fragmentShader from '../shaders/mesh-toon.frag'

export function createCustomToonMaterial({ uniforms }) {
  return new THREE.ShaderMaterial({
    extensions: {
      derivatives: true
    },
    transparent: true,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    fragmentShader,
    vertexShader,
    uniforms: {
      ...uniforms
    }
  })
}

export function convertToToonMaterial(obj, params = {}) {
  const originMaterial = obj.material
  const defaultParams = {
    castShadow: true
  }
  params = Object.assign({}, defaultParams, params)

  if (originMaterial instanceof THREE.MeshToonMaterial) {
    return originMaterial
  }

  // @TIPS: Valid black color is 0x010101
  const outlineColor = (params.outlineColor || params.color) ? new THREE.Color(params.outlineColor || params.color) : originMaterial.color.clone()
  const outlineColorOffset = params.outlineColorOffset !== undefined ? params.outlineColorOffset : -0.5
  const outlineParameters = {
    thickness: typeof params.outlineThickness !== 'undefined' ? params.outlineThickness : 0.0025,
    color: outlineColor.offsetHSL(0, 0, params.outlineColor ? 0 : outlineColorOffset).toArray(),
    alpha: typeof params.outlineAlpha !== 'undefined' ? params.outlineAlpha : 1
  }

  // const bumpMap = asset.items.grainNoiseTexture.clone()
  // bumpMap.needsUpdate = true
  const bumpMap = asset.items.grainNoiseTexture

  if (params.castShadow) {
    obj.castShadow = true
  }

  obj.material = new THREE.MeshToonMaterial({
    displacementMap: asset.items.grainNoiseTexture,
    displacementScale: 0,
    bumpMap,
    bumpScale: 0,
    // gradientMap: asset.items.threeToneTexture,
    map: originMaterial.map || originMaterial.emissiveMap,
    color: originMaterial.color,
    emissive: params.emissive !== undefined ? params.emissive : originMaterial.color,
    emissiveIntensity: 0.2,
    ...params
  })

  if (obj.material.emissiveIntensity > 0) {
    obj.layers.enable(RENDER_LAYERS.BLOOM)
  }

  if (outlineParameters.thickness > 0 && outlineParameters.alpha > 0) {
    obj.material.userData.outlineParameters = {
      ...outlineParameters
    }
    obj.layers.enable(RENDER_LAYERS.OUTLINE)
  }

  return obj.material
}
