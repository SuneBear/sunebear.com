import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { BuildingGroupObject } from '../objects/building.object'

const generatePathOptions = (options) => {
  return {
    position: [ 0, 0, 0 ],
    rotation: [ 0, 0, 0 ],
    scale: 1,
    radius: 1,
    ...options
  }
}

const BUILDING_PATCH_MAP = {
  suneBearHome: generatePathOptions({
    position: [ -10, -0.5, -10 ],
    rotation: [ 0, Math.PI / 4, 0 ],
    scale: 0.5
  })
}

export default class EnviromentBuildings extends Module {

  constructor(sketch) {
    super(sketch)
    const random = Random(true, 'Buildings')
    const group = new THREE.Group()
    group.name = 'envBuildings'
    this.scene.add(group)

    this.group = group

    this.setupSuneBearHome()
  }

  setupSuneBearHome() {
    this.suneBearHome = new BuildingGroupObject({
      model: this.asset.items.buildingSuneBearHomeModel,
      name: 'suneBearHome',
      materialOptionsMap: {
        'grass-left': {
          outlineThickness: 0.002,
          outlineColor: 0x101010
        },
        'grass-right': {
          outlineThickness: 0.002,
          outlineColor: 0x101010
        }
      },
      portalOffset: new THREE.Vector3(),
      onPortalOpened: () => {}
    })

    const patch = BUILDING_PATCH_MAP[this.suneBearHome.name]

    this.suneBearHome.position.fromArray(patch.position)
    this.suneBearHome.rotation.fromArray(patch.rotation)
    this.suneBearHome.scale.setScalar(patch.scale)

    this.group.add(this.suneBearHome)
  }

  setupSnowfallSpace() {

  }

  setupBeacon() {

  }

  setupSunkBuildings() {

  }

  update(delta) {
    this.group.children.map(obj => {
      obj.update && obj.update(delta)
    })
  }

}
