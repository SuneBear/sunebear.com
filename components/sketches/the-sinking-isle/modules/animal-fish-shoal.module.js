import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { RENDER_LAYERS } from '../utils/constants'
import { BoidsManager } from './animal/boids'
import { convertToToonMaterial } from '../objects/mesh-toon.material'

export default class AnimalFishShoal extends Module {

  constructor(sketch) {
    super(sketch)
    const random = Random(true, 'FishShoal')
    const group = new THREE.Group()
    group.name = 'animalFishShoal'

    // this.asset.items.boidFishModel.scene.traverse(obj => )
    const fish = this.asset.items.boidFishModel.scene.getObjectByName('fish_0')
    if (fish) {
      convertToToonMaterial(fish, {
        displacementScale: 1,
        emissive: 0xffffff,
        emissiveIntensity: 0.05,
        outlineThickness: 0.003,
        outlineColor: 0x3b69ae,
      })
    }

    // @TODO: Replace fish model
    this.boidsManager = new BoidsManager({
      player: this.player,
      boidModel: this.asset.items.boidFishModel,
      depthBound: [ this.enviroment.terrainDepth.position.y * 0.5, 0.5 ],
      container: group,
      random
    })

    this.scene.add(group)
  }

  update(delta) {
    this.boidsManager.update(delta)
  }

}
