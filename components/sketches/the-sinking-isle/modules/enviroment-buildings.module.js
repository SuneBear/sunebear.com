import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { BuildingGroupObject } from '../objects/building.object'

const generatePatchOptions = (options) => {
  return {
    position: [ 0, 0, 0 ],
    rotation: [ 0, 0, 0 ],
    scale: 1,
    radius: 1,
    ...options
  }
}

const BUILDING_PATCH_MAP = {
  suneBearHome: generatePatchOptions({
    position: [ -10, -0.5, -10 ],
    rotation: [ 0, Math.PI / 4, 0 ],
    scale: 0.5
  }),
  snowfallSpace: generatePatchOptions({
    position: [ 11, -0.5, 11 ],
    // position: [ 0, -0.5, 0 ],
    rotation: [ 0, 0, 0 ],
    scale: 0.85
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
    this.setupSnowfallSpace()
  }

  setupSuneBearHome() {
    this.suneBearHome = new BuildingGroupObject({
      model: this.asset.items.buildingSuneBearHomeModel,
      name: 'suneBearHome',
      materialOptions: {
        emissiveIntensity: 0
      },
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
      portalPosition: new THREE.Vector3(),
      onPortalOpened: () => {}
    })

    this.applyPatch(this.suneBearHome)
    this.group.add(this.suneBearHome)
  }

  setupSnowfallSpace() {
    this.snowfallSpace = new BuildingGroupObject({
      model: this.asset.items.buildingSnowfallSpaceModel,
      name: 'snowfallSpace',
      onModelSetup: (obj) => {
        if (obj.name.includes('Alpha')) {
          obj.material.transparent = true
        }

        if (obj.name.includes('Zai2_Details')) {
          obj.material.userData.outlineParameters.thickness = 0
        }
      },
      materialOptions: {
        emissiveIntensity: 0
      },
      materialOptionsMap: {
      },
      portalPosition: new THREE.Vector3(),
      onPortalOpened: () => {}
    })

    this.applyPatch(this.snowfallSpace)
    this.group.add(this.snowfallSpace)
  }

  setupBeacon() {

  }

  setupSunkBuildings() {

  }

  applyPatch(object) {
    const patch = BUILDING_PATCH_MAP[object.name]

    if (!patch) {
      console.warn(`can't find patch for object: ${object.name}`)
      return
    }

    object.position.fromArray(patch.position)
    object.rotation.fromArray(patch.rotation)
    object.scale.setScalar(patch.scale)
  }

  update(delta) {
    this.group.children.map(obj => {
      obj.update && obj.update(delta)
    })
  }

}
