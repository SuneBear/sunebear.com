import * as THREE from 'three'
import * as eases from 'eases'

import { addSampleData } from './enviroment/still-life-types'
import { generateStillLifeItemsMap } from './enviroment/still-life-items'
import Module from '../engine/module'
import { math } from '../engine/utils'
import { MeshSpriteObject } from '../objects/mesh-sprite.object'
import { detachObject } from '../utils/three-util'

const worldScale = new THREE.Vector3()
const moveFromOriginRadius = 2
const moveFromOriginRadiusSq = moveFromOriginRadius * moveFromOriginRadius

// Render process: Grid -> cellActiveDataList[] -> StillLifesData[] + itemsMap -> object
// @TODO: Render RefGLTF Objects (Patches)
export default class EnviromentStillLifes extends Module {
  constructor(sketch) {
    super(sketch)

    const container = new THREE.Group()
    container.name = 'envStillLifes'
    this.scene.add(container)

    const frustum = this.camera.frustum
    const envState = this.enviroment.envState
    const cellActiveDataList = this.enviroment.cellActiveDataList

    const tmpBox = new THREE.Box3()
    const itemsMap = generateStillLifeItemsMap(this)

    // Listen Evnets
    this.$vm.$on('cellActiveDataList:add', ({ activeData }) => {
      const c = activeData
      const cell = c.cell
      const random = c.random
      const colorData =
        c.environmentState.colors[
          cell.colorIndex % c.environmentState.colors.length
        ]
      const itemCollection = colorData ? colorData.name : null
      c.children.length = 0

      for (let i = 0; i < cell.samples.length; i++) {
        const idx = cell.samples[i]
        const stillLifeData = initStillLifeData()
        const t = stillLifeData
        const pos = c.environmentState.samples[idx]
        t.x = pos[0]
        t.z = pos[1]
        t.activeData = c
        const child = addSampleData(itemsMap, t, itemCollection, random)
        if (child) {
          container.add(child)
        }
        c.children.push(t)
      }

      for (let i = 0; i < cell.waterSamples.length; i++) {
        const idx = cell.waterSamples[i]
        const stillLifeData = initStillLifeData()
        const t = stillLifeData
        const pos = c.environmentState.waterSamples[idx]
        t.x = pos[0]
        t.z = pos[1]
        t.activeData = c
        if (random.chance(0.5)) {
          const child = addSampleData(
            itemsMap,
            t,
            c.environmentState.waterCollectionName,
            random
          )
          // const child = new MeshSpriteObject({
          //   map: this.asset.items.testTexture,
          //   uniforms: this.enviromentTrace.getTraceUniforms()
          // })
          t.instance = child
          if (child) {
            container.add(child)
          }
        } else {
          t.isWaterFishPlacelder = true
        }
        c.children.push(t)
        this.$vm.$emit('stillLifesData:add', { stillLifeData })
      }

      for (let i = 0; i < cell.tokens.length; i++) {
        const stillLifeData = initStillLifeData()
        const idx = cell.tokens[i]
        stillLifeData.type = 'token'

        const token = c.environmentState.tokens[idx]
        stillLifeData.tokenType = token.type

        const t = stillLifeData
        t.x = token.position[0]
        t.z = token.position[1]
        t.cell = cell
        c.children.push(t)
        this.$vm.$emit('stillLifesData:add', { stillLifeData })
      }

      // @TODO: Add cell.patches
    })

    this.$vm.$on('cellActiveDataList:remove', ({ activeData }) => {
      activeData.children = activeData.children
        .map(child => {
          if (child.isStillLife && child.instance) {
            detachObject(child.instance)
            child.instance = null
          }
          return child
        })
        .filter(child => child.instance)
    })

    this.$vm.$on('stillLifesData:add', ({ stillLifeData }) => {
      if (envState.isBarrenGround) {
        stillLifeData.sizeFactor = 0
      }
      if (stillLifeData.type === 'sprite') {
        this.renewStillLifeObject(stillLifeData)
      }
    })

    // @TODO: Maybe place envState to $vm is much better, just use $watch
    this.$vm.$on('envState.isBarrenGround:update', () => {
      if (!envState.isBarrenGround) {
        this.traverseStillLifes(this.tweenInStillLifeSprite)
      }
    })

    // Process
    this.envStillLifesProccess = dt => {
      this.traverseStillLifes(d => {
        if (!d.instance) {
          return
        }

        // frustum objects
        const obj = d.instance
        tmpBox.setFromObject(obj)
        if (d.type === 'sprite') {
          patchSpriteBox3(tmpBox, obj)
        }
        const visible = frustum.intersectsBox(tmpBox)
        obj.visible = visible

        if (d.type !== 'token' && d.type !== 'patch') {
          const t = d.sizeFactor
          const instance = d.instance
          // const t = Math.sin(instance.material.uniforms.time.value) * 0.5 + 0.5
          if (instance && instance.material) {
            if (instance.material.uniforms.animateProgress) {
              instance.material.uniforms.animateProgress.value = eases.sineIn(t)
            }
            if (instance.material.uniforms.time) {
              instance.material.uniforms.time.value += dt
            }
          }
          instance.scale.copy(d.scale).multiplyScalar(0.5 + t / 2)
        }
      })
    }
  }

  renewStillLifeObject(stillLifeData) {
    const instance = stillLifeData.instance

    if (!instance) return

    instance.position.set(stillLifeData.x, 0, stillLifeData.z)
    const isSprite = instance.isMesh && instance.userData.type === 'meshSprite'
    const minScale = 0.95
    const maxScale = 1.05
    let curScale = math.clamp(
      Math.abs(stillLifeData.variance),
      minScale,
      maxScale
    )
    instance.scale.multiplyScalar(curScale)
    stillLifeData.scale.copy(instance.scale)
    if (isSprite) {
      const isFlip = stillLifeData.flip && !stillLifeData.ignoreFlip
      instance.material.uniforms.flip.value = isFlip ? -1 : 1
      instance.material.side = isFlip ? THREE.BackSide : THREE.FrontSide
      let useMapDiscard = false
      if (typeof stillLifeData.useMapDiscard === 'boolean') {
        useMapDiscard = stillLifeData.useMapDiscard
      }
      instance.material.uniforms.useMapDiscard.value = useMapDiscard
      const aspect = instance.scale.x / instance.scale.y
      instance.material.uniforms.enbleIdleEffect.value = true
      instance.material.uniforms.aspect.value = aspect
      instance.material.uniforms.spriteHeight.value = instance.scale.y
      instance.material.uniforms.time.value = 0
    } else {
      instance.rotation.y = stillLifeData.rotation
    }
  }

  traverseStillLifes(callback) {
    const cellActiveDataList = this.enviroment.cellActiveDataList

    const stillLifesData = []
    cellActiveDataList.map(activeData => {
      activeData.children.map(d => {
        stillLifesData.push(d)
        callback.bind(this)(d)
      })
    })

    return stillLifesData
  }

  tweenInStillLifeSprite(d) {
    const tmp2D = new THREE.Vector2()

    if (
      d.type === 'token' ||
      d.type === 'patch' ||
      d.sizeFactor > 0
    ) {
      return
    }
    const delayOff = math.clamp01(
      tmp2D.set(d.x, d.z).length() / 50
    )
    const delay = delayOff * 1 + this.random.range(0, 1)
    this.tween.add({
      target: d,
      sizeFactor: [0, 1],
      duration: 3,
      delay
    })
  }

  update(delta) {
    this.envStillLifesProccess(delta)
    this.updateBarrenGroundState()
  }

  updateBarrenGroundState() {
    const { envState } = this.enviroment
    const { targetPos } = this.player

    const lenSq = targetPos.lengthSq()
    if (envState.isBarrenGround && lenSq >= moveFromOriginRadiusSq) {
      envState.isBarrenGround = false
      this.$vm.$emit('envState.isBarrenGround:update')
    }
  }
}

function initStillLifeData() {
  return {
    x: 0,
    z: 0,
    activeData: null,
    isStillLife: true,
    instance: null, // Three.js Object
    key: null,
    audio: false,
    // @Values: sprite, token, patch
    type: 'sprite',
    useMapDiscard: false,
    ignoreFlip: false,
    height: null,
    rotation: 0,
    varianceMean: null,
    varianceStd: null,
    minSize: null,
    maxSize: null,
    flip: false,
    scale: new THREE.Vector3(),
    sizeFactor: 1,
    variance: 0
  }
}

function patchSpriteBox3(box, sprite) {
  sprite.getWorldScale(worldScale)
  const scaleY = worldScale.y
  box.max.y += scaleY * 0.4 // more as it's not axis-aligned but camera-aligned
  box.min.x -= 2 // more for shadow
  box.max.x += 0 // more for some edge ../
}
