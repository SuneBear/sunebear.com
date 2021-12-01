import Module from '../engine/module'
import { PlayableMeshSpriteObject } from '../objects/mesh-sprite.object'
import { parseSpritesheets } from '../utils/spritesheet'

export default class AnimalMisc extends Module {

  constructor(sketch) {
    super(sketch)

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
    this.scene.add(this.butterfly)
  }

  update(delta) {
    this.butterfly.update(delta)
    // @TODO: Spawn Animals, Add animal-butterfly.module
  }

}
