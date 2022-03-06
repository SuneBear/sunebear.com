import * as THREE from 'three'
import gsap from 'gsap'
import { asset } from '../engine/asset'
import { RENDER_LAYERS } from '../utils/constants'
import { circlesIntersect } from '../utils/geometry'

import { BloomPulseAnimation } from './animations'
import { ShadowSprite } from './sprite.object'
import { convertToMeshSprite } from './mesh-sprite.object'

export const ALL_TOKEN_NAMES = [
  'sun',
  'moon',
  'wind',
  'mist',
  'rain',
  'storm',
  'tree',
  'leaf',
  'fish',
  'animal',
  'feather',
  'grass',
  'flower',
  'insect',
  'snow',
  'stars'
]

function getTokenMapByName (name) {
  const map = asset.items[`${name}TokenTexture`]

  if (map && ALL_TOKEN_NAMES.includes(name)) {
    return map
  }

  console.warn('Token: ${name} was invalid')
}

export class TokenObject extends THREE.Group {

  constructor(options = {}) {
    super()

    this.options = {
      name: 'sun',
      ...options
    }

    this.name = 'token'
    this.radius = 1
    this.worldPosition = new THREE.Vector3()
    this.originPositionY = 0

    const normalTokenMesh = new THREE.Mesh()
    normalTokenMesh.material.map = getTokenMapByName(this.options.name)
    this.tokenBody = convertToMeshSprite({ object: normalTokenMesh, uniforms: {
      // @Hack: emissiveIntensity is invalid, use tintColor to mock that reducing brightness/exposure
      tintColor: { value: new THREE.Color(0xbbbbbb) }
    } })
    this.tokenBody.name = this.options.name
    this.tokenBody.material.depthTest = false
    // this.tokenBody.material.emissive = new THREE.Color(0xffffff)
    // this.tokenBody.material.emissiveIntensity = 0
    this.tokenBodyBloomAnimtion = new BloomPulseAnimation({
      object: this.tokenBody
    })
    this.tokenBody.layers.enable(RENDER_LAYERS.BLOOM)
    this.tokenBody.layers.enable(RENDER_LAYERS.SHADOW)

    const shadow = new ShadowSprite()
    this.tokenShadow = shadow
    shadow.position.y = -1
    shadow.scale.set(2, 0.66, 1).multiplyScalar(0.5)

    this.add(this.tokenBody)
    this.add(this.tokenShadow)
  }

  updateWorldPosition() {
    this.getWorldPosition(this.worldPosition)
    this.originPositionY = this.position.y
  }

  async animateIn() {
    const { needAnimateY } = this.options
    const target = this.tokenBody.material.uniforms.animateProgress

    if (this.isAnimatingIn) {
      return
    }

    this.isAnimatingOut = false
    gsap.killTweensOf(target)
    gsap.killTweensOf(this.position)

    if (target.value >= 1) {
      return
    }

    this.isAnimatingIn = true

    if (needAnimateY) {
      gsap.to(this.position, {
        y: this.originPositionY,
        duration: 2
      })
    }

    await gsap.to(target, {
      value: 1,
      duration: 2,
      onComplete: () => {
      }
    })

  }

  async animateOut() {
    const { needAnimateY, onAnimateOut } = this.options
    const target = this.tokenBody.material.uniforms.animateProgress

    if (this.isAnimatingOut) {
      return
    }

    this.isAnimatingIn = false
    gsap.killTweensOf(target)
    gsap.killTweensOf(this.position)

    this.isAnimatingOut = true

    if (needAnimateY) {
      gsap.to(this.position, {
        y: this.originPositionY * 0.583,
        duration: 0.5
      })
    }

    await gsap.to(target, {
      value: 0.25,
      duration: 2,
      ease: 'none'
    })

    onAnimateOut && onAnimateOut()
  }

  isIntersect(objectB) {
    const positionA = [ this.worldPosition.x, this.worldPosition.z ]
    const positionB = [ objectB.position.x, objectB.position.z]
    const radiusB = objectB.radius || 0.8
    return circlesIntersect(positionA, this.radius, positionB, radiusB)
  }

  update(delta) {
    // this.tokenBodyBloomAnimtion.update(delta)
  }

}
