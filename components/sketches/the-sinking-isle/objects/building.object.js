import * as THREE from 'three'
import { asset } from '../engine/asset'
import { WaterBuoyancyAnimation } from './animations'
import { convertToToonMaterial } from './mesh-toon.material'

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

  update(delta) {
    this.waterBuoyancyAnimation.update(delta)
  }

}
