import * as THREE from 'three'
import Module from './base'
import { PlayableMeshSpriteObject } from '../objects/mesh-sprite.object'
import { parseSpritesheets } from '../utils/spritesheet'

export default class AnimalMisc extends Module {

  constructor(sketch) {
    super(sketch)

    this.container = new THREE.Group()
    this.container.name = 'animalMisc'

    this.scene.add(this.container)

    this.setupButterfly()
  }

  setupButterfly() {
    const spritesheet = parseSpritesheets({
      sheets: this.asset.items.butterflyFlySpritesheet,
      renderer: this.renderer
    })
    this.butterfly = new PlayableMeshSpriteObject({
      spritesheet
    })
    this.butterfly.name = 'butterfly'
    this.butterfly.position.y = 2
    this.butterfly.setFlip(true)
    this.container.add(this.butterfly)
  }

  update(delta) {
    this.butterfly.update(delta)
    // @TODO: Spawn Animals, Add animal-butterfly.module
  }

}
