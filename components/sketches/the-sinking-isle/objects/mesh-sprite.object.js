import * as THREE from 'three'

import vertexShader from '../shaders/mesh-sprite.vert'
import fragmentShader from '../shaders/mesh-sprite.frag'
import { asset } from '../engine/asset'
import { random } from '../engine/utils'

const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
planeGeo.translate(0, 0.5, 0)

function createSpriteMaterial(uniforms) {
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
      shadowColor: { value: new THREE.Color('#280422') },
      map: { value: null },
      maskMap: { value: asset.items.spriteMaskTexture },
      randomOffset: { value: random.value() },
      flip: { value: 1 },
      silhouette: { value: false, type: 'b' },
      enbleIdleEffect: { value: false, type: 'b' },
      useMapDiscard: { value: false, type: 'b' },
      color: { value: new THREE.Color('white') },
      time: { value: 0 },
      animateProgress: { value: 1 },
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
  constructor({ map, uniforms = {} } = {}) {
    super()

    this.geometry = planeGeo
    this.material = createSpriteMaterial(uniforms)

    this.userData.type = 'meshSprite'

    if (map) {
      this.setMap(map)
    }
  }

  setFlip(flipX) {
    this.material.uniforms.flip.value = flipX ? -1 : 1
    this.material.side = flipX ? THREE.BackSide : THREE.FrontSide
  }

  setMap(map) {
    if (!map) {
      return
    }
    this.material.uniforms.map.value = map
    this.material.uniforms.repeat.value.copy(map.repeat)
    this.material.uniforms.offset.value.copy(map.offset)
  }
}

export class PlayableMeshSpriteObject extends MeshSpriteObject {
  constructor({ map, uniforms = {}, spritesheet, animationOptions = {} } = {}) {
    super({ map, uniforms })

    this.loop = true
    // Scale source size for retina display
    this.sourceScale = 0.4
    this.framerate = 1 / 12
    this.isPlaying = true
    this.elapsed = 0
    this.data = spritesheet
    this.skipFrames = []
    this.currentFrame = 0
    this.currentFrameData = spritesheet.frames[0]

    Object.assign(this, animationOptions)

    this.setupSizeByFrame(this.currentFrameData)
  }

  setupSizeByFrame(frame) {
    const wholeScale = this.sourceScale
    const aspect = frame.width / frame.height
    this.scale.set(wholeScale * aspect, wholeScale, 1)
    this.material.uniforms.aspect.value = aspect
    this.material.uniforms.spriteHeight.value = this.scale.y
  }

  play() {
    this.isPlaying = true
  }

  pause() {
    this.isPlaying = false
  }

  stop() {
    this.pause()
    this.currentFrameIndex = 0
  }

  gotoFrame(frame) {
    this.currentFrame = frame
    this.pause()
  }

  update(dt) {
    this.material.uniforms.time.value += dt

    if (!this.isPlaying) return

    let hasUpdated = false

    this.elapsed += dt

    const totalFrames = this.data.frames.length
    const endFrame = this.loop && this.loopEnd ? this.loopEnd : totalFrames - 1

    if (this.elapsed >= this.framerate) {
      this.elapsed = 0
      this.currentFrame++
      hasUpdated = true
      if (this.isFrameValid(this.currentFrame))
        this.currentFrameData = this.data.frames[this.currentFrame]
    }

    if (this.currentFrame >= endFrame && this.loop) {
      this.currentFrame = this.loopStart ? this.loopStart : 0
      this.currentFrameData = this.data.frames[this.currentFrame]
    }

    this.currentFrame = Math.max(0, Math.min(this.currentFrame, totalFrames))

    const data = this.data
    const currentFrameData = this.currentFrameData

    if (currentFrameData && this.currentFrame != 0) {
      this.setMap(currentFrameData.texture)
      // this.material.uniforms.uSize.value.x =
      //   currentFrameData.sourceSize.w / data.meta.size.w
      // this.material.uniforms.uSize.value.y =
      //   currentFrameData.sourceSize.h / data.meta.size.h
      // this.material.uniforms.uOffset.value.x =
      //   currentFrameData.frame.x / data.meta.size.w
      // this.material.uniforms.uOffset.value.y =
      //   1 - currentFrameData.frame.y / data.meta.size.h
    }

    return hasUpdated
  }

  isFrameValid(frameIdx) {
    let res = true
    for (let i = 0; i < this.skipFrames.length; i++) {
      if (this.skipFrames[i] == frameIdx) res = false
    }

    return res
  }
}
