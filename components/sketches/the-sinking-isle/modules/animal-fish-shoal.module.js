import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { RENDER_LAYERS } from '../utils/constants'
import { BoidsManager } from './animal/boids'

export default class AnimalFishShoal extends Module {

  constructor(sketch) {
    super(sketch)
    const random = Random(true, 'FishShoal')
    const group = new THREE.Group()
    group.name = 'animalFishShoal'

    // this.asset.items.boidFishModel.scene.traverse(obj => obj.layers.enable(RENDER_LAYERS.BLOOM))
    const fish = this.asset.items.boidFishModel.scene.getObjectByName('fish')
    if (fish) {
      // fish.material = new THREE.MeshStandardMaterial({ emissive: 0xff0000 })
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
