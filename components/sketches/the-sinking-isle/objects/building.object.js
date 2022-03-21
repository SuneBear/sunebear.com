import * as THREE from 'three'
import { asset } from '../engine/asset'
import { RENDER_LAYERS } from '../utils/constants'
import { WaterBuoyancyAnimation } from './animations'
import { convertToToonMaterial } from './mesh-toon.material'
import { TokenObject } from './token.object'

export class BuildingGroupObject extends THREE.Group {

  constructor(options = {}) {
    super()

    this.options = {
      materialOptions: {},
      materialOptionsMap: {},
      waterBuoyancyIntensity: 1,
      ...options
    }

    this.name = this.options.name
    this.model = this.options.model

    // @TODO: Support config animation
    this.waterBuoyancyAnimation = new WaterBuoyancyAnimation({
      object: this,
      intensity: this.options.waterBuoyancyIntensity
    })

    this.setupModel()
    this.setupPortalToken()
    this.setupAnimationMixer()
  }

  setupModel() {
    const { onModelSetup, materialOptionsMap } = this.options
    const { scene } = this.model

    // scene.frustumCulled = false

    scene.traverse(obj => {
      if (obj.material) {
        obj.renderOrder = RENDER_LAYERS.BUILDING
        // obj.matrixAutoUpdate = false
        // obj.frustumCulled = false
        const materialOptions = materialOptionsMap[obj.name]
        convertToToonMaterial(obj, {
          outlineThickness: 0.005,
          emissiveIntensity: 0,
          bumpMap: asset.items.floorOverlayTexture,
          bumpScale: 1,
          // normalMap: asset.items.floorOverlayTexture,
          // normalScale: new THREE.Vector2(0.1, 0.1),
          transparent: false,
          castShadow: false,
          ...this.options.materialOptions,
          ...materialOptions
        })
        onModelSetup && onModelSetup(obj)
      }
    })

    this.add(scene)
  }

  setupPortalToken() {
    const { portal } = this.options

    if (!portal) {
      return
    }

    const token = new TokenObject({
      name: portal.name,
      needAnimateY: portal.needAnimateY,
      onAnimateOut: portal.onOpened
    })
    token.scale.setScalar(2)
    token.position.copy(portal.position)

    this.token = token
    this.add(token)

    setTimeout(() => {
      token.updateWorldPosition()
    })
  }

  setupAnimationMixer() {
    const { scene, animations } = this.model

    this.clips = animations || []
    if (!this.clips.length) return

    this.mixer = new THREE.AnimationMixer(scene)
    this.clips.map((clip) => {
      this.mixer.clipAction(clip).reset().play()
    })
  }

  update(delta) {
    this.mixer && this.mixer.update(delta)
    this.waterBuoyancyAnimation.update(delta)
    if (this.token) {
      this.token.update(delta)
    }
  }

}
