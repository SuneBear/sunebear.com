import * as THREE from 'three'
import { asset } from '../engine/asset'
import { WaterBuoyancyAnimation } from './animations'
import { convertToToonMaterial } from './mesh-toon.material'
import { TokenObject } from './token.object'

export class BuildingGroupObject extends THREE.Group {

  constructor(options = {}) {
    super()

    this.options = {
      materialOptions: {},
      materialOptionsMap: {},
      ...options
    }

    this.name = this.options.name
    this.model = this.options.model

    this.waterBuoyancyAnimation = new WaterBuoyancyAnimation({
      object: this
    })

    this.setupModel()
    this.setupPortalToken()
  }

  setupModel() {
    const { onModelSetup, materialOptionsMap } = this.options
    const { scene } = this.model

    scene.traverse(obj => {
      if (obj.material) {
        const materialOptions = materialOptionsMap[obj.name]
        convertToToonMaterial(obj, {
          outlineThickness: 0.005,
          emissiveIntensity: 0.1,
          bumpMap: asset.items.floorOverlayTexture,
          bumpScale: 1,
          // normalMap: asset.items.floorOverlayTexture,
          // normalScale: new THREE.Vector2(0.1, 0.1),
          transparent: false,
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

  update(delta) {
    this.waterBuoyancyAnimation.update(delta)
    if (this.token) {
      this.token.update(delta)
    }
  }

}
