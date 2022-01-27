import * as THREE from 'three'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { BuildingGroupObject } from '../objects/building.object'
import { AttentionIndicatorObject, BubbleMessageObject } from '../objects/vue-2d.object'
import { createDepthFadeMaterial } from '../objects/depth-fade.object'
import { RENDER_LAYERS } from '../utils/constants'

const generatePatchOptions = options => {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    radius: 1,
    ...options
  }
}

const BUILDING_PATCH_MAP = {
  suneBearHome: generatePatchOptions({
    position: [-10, -0.3, -10],
    rotation: [0, Math.PI / 4, 0],
    scale: 0.5
  }),
  snowfallSpace: generatePatchOptions({
    position: [11, -0.3, 11],
    // position: [ 0, -0.5, 0 ],
    rotation: [0, 0, 0],
    scale: 0.85
  })
}

export default class EnviromentBuildings extends Module {
  constructor(sketch) {
    super(sketch)

    this.random = Random(true, 'Buildings')

    const group = new THREE.Group()
    group.name = 'envBuildings'
    this.group = group
    this.scene.add(group)

    this.setupSuneBearHome()
    this.setupSnowfallSpace()
    // this.setupSunkBuildings()
    this.setupTokens()
  }

  setupSuneBearHome() {
    this.suneBearHome = new BuildingGroupObject({
      model: this.asset.items.buildingSuneBearHomeModel,
      name: 'suneBearHome',
      materialOptions: {
        emissiveIntensity: 0.1
      },
      materialOptionsMap: {
        base: {
          outlineThickness: 0.0001
        },
        'grass-left': {
          outlineThickness: 0.002,
          outlineColor: 0x101010
        },
        'grass-right': {
          outlineThickness: 0.002,
          outlineColor: 0x101010
        }
      },
      portal: {
        name: 'sun',
        position: new THREE.Vector3(-4, 6, 4),
        needAnimateY: true,
        onOpened: () => {
          this.$vm.currentChapter = 'suneBearHome'
        }
      },
    })

    this.applyPatch(this.suneBearHome)
    this.group.add(this.suneBearHome)
  }

  setupSnowfallSpace() {
    this.snowfallSpace = new BuildingGroupObject({
      model: this.asset.items.buildingSnowfallSpaceModel,
      name: 'snowfallSpace',
      onModelSetup: obj => {
        if (obj.name.includes('Alpha')) {
          obj.material.transparent = true
        }

        if (obj.name.includes('Snow_L')) {
          obj.material.bumpScale = 0
        }

        if (obj.name.includes('face') || obj.name.includes('Zai')) {
          obj.material.userData.outlineParameters.thickness = 0
        }

        if (obj.name.includes('Base_0')) {
          obj.castShadow = true
        }
      },
      materialOptions: {
        castShadow: false,
        emissiveIntensity: 0.05
      },
      materialOptionsMap: {
        Ground_L_Base_0: {
          castShadow: true
        }
      },
      portalPosition: new THREE.Vector3(),
      onPortalOpened: null
    })

    // Setup Indicator
    const introIndicatorTarget = this.snowfallSpace.getObjectByName('Snegir_Details_0')
    const indicator =  new AttentionIndicatorObject({
      onClick: () => {
        new BubbleMessageObject({ message: this.$vm.$t('tsi.snowfallSpace.intro') }, introIndicatorTarget)
      }
    })
    indicator.position.y = 20
    if (introIndicatorTarget) {
      introIndicatorTarget.add(indicator)
    }

    this.applyPatch(this.snowfallSpace)
    this.group.add(this.snowfallSpace)
  }

  setupBeacon() {}

  setupTheSinkingIsle() {}

  // @TODO: Replace geometry
  // @TODO: Create deep lake feeling
  setupSunkBuildings() {
    const { worldSize, lakeDepth } = this.config
    const random = this.random
    const count = 200
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100)
    const minDepth = -50
    const material = createDepthFadeMaterial({
      uAlpha: {
        value: 0.12
      },
      uLimitDistance: {
        value: lakeDepth + minDepth
      },
      uOriginPosition: {
        value: new THREE.Vector3(0, minDepth, 0)
      }
    })
    const matrix = new THREE.Matrix4()
    const mesh = new THREE.InstancedMesh(geometry, material, count)
    const particles = new Array(count).fill({}).map(el => ({
      time: random.range(0, 100)
    }))

    const randomizeMatrix = (function() {
      const position = new THREE.Vector3()
      const rotation = new THREE.Euler()
      const quaternion = new THREE.Quaternion()
      const scale = new THREE.Vector3()

      return function(matrix) {
        position.x = random.range(-worldSize / 2, worldSize / 2)
        position.y = random.range(-lakeDepth, minDepth)
        position.z = random.range(-worldSize / 2, worldSize / 2)

        rotation.x = Math.random() * 2 * Math.PI
        rotation.y = Math.random() * 2 * Math.PI
        rotation.z = Math.random() * 2 * Math.PI

        scale.x = scale.y = scale.z = random.range(0.4, 0.8)

        quaternion.setFromEuler(rotation)
        matrix.compose(position, quaternion, scale)
      }
    })()

    const updateMatrix = (function() {
      const position = new THREE.Vector3()
      const rotation = new THREE.Euler()
      const quaternion = new THREE.Quaternion()
      const scale = new THREE.Vector3()
      const speedInSecondUnit = 0.004

      return function(matrix, delta, i) {
        matrix.decompose(position, quaternion, scale)
        rotation.setFromQuaternion(quaternion)
        const particle = particles[i]
        particle.time += delta

        scale.setScalar(Math.abs(Math.sin(particle.time * speedInSecondUnit * 10)))

        position.y += Math.sin(particle.time) * speedInSecondUnit
        position.x += Math.sin(particle.time) * speedInSecondUnit
        position.z += Math.cos(particle.time) * speedInSecondUnit

        // rotation.x += speedInSecondUnit
        // rotation.y += speedInSecondUnit
        // rotation.z += speedInSecondUnit

        quaternion.setFromEuler(rotation)
        matrix.compose(position, quaternion, scale)
      }
    })()

    mesh.layers.enable(RENDER_LAYERS.BLOOM)
    mesh.update = (delta) => {
      for (let i = 0; i < count; i++) {
        mesh.getMatrixAt(i, matrix)
        updateMatrix(matrix, delta, i)
        mesh.setMatrixAt(i, matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    for (let i = 0; i < count; i++) {
      randomizeMatrix(matrix)
      mesh.setMatrixAt(i, matrix)
    }

    const testDepthFadeMesh = new THREE.Mesh(
      geometry,
      createDepthFadeMaterial({
        uLimitDistance: {
          value: 2
        },
      })
    )
    testDepthFadeMesh.layers.enable(RENDER_LAYERS.OUTLINE)
    testDepthFadeMesh.scale.setScalar(5)
    // this.group.add(testDepthFadeMesh)

    this.group.add(mesh)
  }

  setupTokens() {
    this.tokens = []
    this.scene.traverse(obj => {
      if (obj.name === 'token') {
        this.tokens.push(obj)
      }
    })
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

    this.updateToken()
  }

  updateToken() {
    this.tokens.some(token => {
      const isIntersect = token.isIntersect(this.player)

      if (isIntersect) {
        token.animateOut()
      } else {
        token.animateIn()
      }

      return isIntersect
    })
  }
}
