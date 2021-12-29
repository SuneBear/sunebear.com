import * as THREE from 'three'
import { asset } from '../engine/asset'
import { RENDER_LAYERS } from '../utils/constants'

export class ShadowSprite extends THREE.Sprite {
  constructor() {
    super()

    this.name = 'shadowSprite'

    this.material = new THREE.SpriteMaterial({
      map: asset.items.softCircleTexture,
      depthTest: false,
      depthWrite: false,
      // blending: THREE.MultiplyBlending,
      color: 'hsl(0, 0%, 0%)',
      opacity: 0.12,
      transparent: true
    })

    this.layers.disableAll()
    this.layers.enable(RENDER_LAYERS.SHADOW)

    this.scale.set(2, 1, 1)
  }
}
