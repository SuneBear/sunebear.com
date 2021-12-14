import * as THREE from 'three'
import { getWeightedSets } from './still-life-types'
import { ObjectPool } from '../../engine/utils'
import { MeshSpriteObject, convertToMeshSprite } from '../../objects/mesh-sprite.object'
import { RENDER_LAYERS } from '../../utils/constants'
import { parseSpritesheets } from '../../utils/spritesheet'

export const generateStillLifeItemsMap = module => {
  // TODO: this should be cleaned up so we aren't waiting
  // on all item set assets upfront...
  const pools = new Map()
  const itemsMap = new Map()
  const scenes = new Map()
  const sceneInstanceCache = new Map()
  const tmpWorldScale = new THREE.Vector3()
  const texturesMap = {}
  let spritesMap = {}

  const renderer = module.renderer
  const envState = module.enviroment.envState
  const assetItems = module.asset.items
  const uniforms = {
    ...module.enviromentTrace.getTraceUniforms()
  }

  // Process
  const itemCollectionNames = [
    envState.waterCollectionName,
    ...envState.colors.map(color => color.name)
  ]

  initAsssetMaps()
  initScenesByManual()
  initItemsMap()

  return itemsMap

  // Define functions
  function initAsssetMaps() {
    const threeSpritesheets = parseSpritesheets({
      sheets: [
        assetItems.stillWaterItemsSpritesheet,
        assetItems.stillGroundItemsSpritesheet
      ],
      renderer
    })
    spritesMap = threeSpritesheets.spritesMap
  }

  function initScenesByManual() {
    // @TODO: Build scene via glb file, support 3d model as patch
    itemCollectionNames.map(name => {
      const scene = new THREE.Scene()
      const sizeLimit = 256
      Object.keys(spritesMap).map(key => {
        const item = spritesMap[key]
        if (item.type === name) {
          const object = new MeshSpriteObject()
          const wholeScale = item.height / sizeLimit
          const aspect = item.width / item.height
          object.scale.set(wholeScale * aspect, wholeScale, 1)
          if (item.width > sizeLimit) {
            object.scale.multiplyScalar(sizeLimit / item.width)
          }
          object.userData.textureName$ = key
          object.userData.tag = item.tag || 'untagged'
          scene.add(object)
        }
      })
      scenes.set(name, scene)
    })
  }

  function initItemsMap() {
    itemCollectionNames.map(name => {
      const scene = initSceneByName(name, false, false)
      const sets = getWeightedSets(scene.children)
      const items = collectionItems(sets)
      itemsMap.set(name, items)

      sets.forEach(set => {
        set.value.forEach(item => {
          items.getPool(item, 10)
        })
      })
    })
  }

  function collectionItems(sets) {
    return {
      sets,
      getPool,
      next(instance) {
        return nextPooledInstance(instance)
      }
    }
  }

  function getPool(instance, initialCapacity = 1) {
    let pool
    if (!pools.has(instance)) {
      pool = createInstancePool(instance, initialCapacity)
      pools.set(instance, pool)
    } else {
      pool = pools.get(instance)
    }
    return pool
  }

  function nextPooledInstance(instance) {
    return getPool(instance).next()
  }

  function createInstancePool(instance, initialCapacity = 1) {
    return new ObjectPool({
      initialCapacity,
      create() {
        const m = fastCloneScene(instance)
        m.userData._pool = this
        return m
      },
      renew(m) {
        if (m.userData) m.userData._pool = this
        createEntities(m)
        return m
      },
      release(m) {
        if (m.userData) m.userData._pool = null
        killEntities(m)
      }
    })
  }

  function killEntities(scene) {
    scene.traverse(child => {
      if (child.userData && child.userData._entity) {
        child.userData._entity = null
      }
    })
  }

  function createEntities(scene) {
    scene.traverse(child => {
      if (child.isMesh) {
        createChildEntity(child)
      }
    })
  }

  function getTextureByName(name) {
    if (texturesMap[name]) {
      return texturesMap[name]
    }
    if (spritesMap[name]) {
      const spriteItem = spritesMap[name]
      return spriteItem.texture
    }
  }

  function initSceneByName(name, pooling, debounceCreate) {
    let instance
    if (sceneInstanceCache.has(name)) {
      instance = sceneInstanceCache.get(name)
    } else {
      // First extract the type of scene we need to load
      instance = scenes.get(name)
      if (!instance) {
        console.warn(`No scene by name ${name}`)
      }
      mountSceneInstance(instance)
      sceneInstanceCache.set(name, instance)
    }

    const needsClone = true
    if (pooling) {
      const pool = getPool(instance)
      return pool.next()
    } else {
      if (needsClone) return fastCloneScene(instance)
      else return instance
    }
  }

  async function mountSceneInstance(scene) {
    const childrenToLoad = []
    scene.traverse(child => {
      if (child.isMesh) {
        childrenToLoad.push(child)
      }
    })
    childrenToLoad.map(async child => {
      const isSprite =
        child.isSprite || child.userData.type === 'meshSprite'
      if (child.userData.textureName$) {
        const map = getTextureByName(child.userData.textureName$)
        if (child.material.uniforms) child.material.uniforms.map.value = map
        else child.material.map = map
        if (!isSprite && map) map.flipX = false
        delete child.userData.textureName$
      }

      createSceneChild(child)
    })
    return scene
  }

  function fastCloneScene(scene) {
    const newScene = scene.clone(true)
    newScene.traverse(child => {
      if (child.isMesh) {
        createSceneChild(child)
      }
    })
    return newScene
  }

  function createChildEntity(child) {
    const isSprite = child.isSprite || child.userData.type === 'meshSprite'
    if (child.userData._entity) {
      console.error('ERROR: Entity already existed on child, removing it.')
    }
    child.layers.set(RENDER_LAYERS.GROUND_STILL_LIFE)

    const tag = child.userData ? child.userData.tag : null
    const ignoreShadow = tag ? tag.includes('noshadow') : false
    if (isSprite) {
      const spriteScaleY = child.getWorldScale(tmpWorldScale).y
      child.userData._entity = true
      if (!ignoreShadow) child.userData.shadowCaster = true

      if (tag !== 'origin_tree') {
        if (spriteScaleY > 5) {
          // TODO: use a tag in the editor instead of checking height
          child.userData.willTriggerAudio = true
        }
      }
    } else {
      child.userData._entity = true
      if (!ignoreShadow) child.userData.shadowCaster = true
    }
  }

  function createSceneChild(child) {
    const isSprite = child.isSprite || child.userData.type === 'meshSprite'

    if (isSprite) {
      convertToMeshSprite({ object: child, uniforms })
    } else {
      const map =
        child.material.uniforms && child.material.uniforms.map
          ? child.material.uniforms.map.value
          : child.material.map

      const tag = child.userData ? child.userData.tag : null
      const ignoreGround = tag
        ? tag.includes('noshadow') || tag.includes('noground')
        : false

      if (ignoreGround) {
        child.material.alphaTest = 0.5
        child.material.transparent = true
      }
      // child.material = createMeshMaterial(child, { map, ignoreGround })
      map.minFilter = THREE.LinearFilter
      map.generateMipmaps = false
    }
  }
}
