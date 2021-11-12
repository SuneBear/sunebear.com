import * as THREE from 'three'
import Module from '../engine/module'

import { EnvironmentGrid } from './enviroment/env-grid'
import { generateEnvSamples } from './enviroment/generate-env-samples'
import { generateLakeGeo } from './enviroment/generate-env-lake-geo'
import { generateEnvDataTextureMap } from './enviroment/generate-env-data-textures'
import { EnvTerrainPlaneObject } from '../objects/env-terrain-plane.object'
import { EnvWaterPlaneObject } from '../objects/env-water-plane.object'

import { RENDER_LAYERS } from '../utils/constants'
import { insideWaterPolys } from '../utils/water-util'

import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/post-under-water-distort.frag'
import { Random } from '~/utils/random'

// @TODO: Render world boundary
export default class Enviroment extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupScene()
    this.setupInfo()
    this.setupGrid()
    this.setupLake()
    this.setupSamples()
    this.setupTerrain()
    // this.setupOctopus()
    this.setupPostUnderWaterDistort()
  }

  setupScene() {
    // @TODO: Only show black scene when reneder bloom effect
    this.scene.background = new THREE.Color(0x000000) // new THREE.Color(0xffffff)
  }

  setupInfo() {
    const { worldSize } = this.config
    const width = worldSize
    const height = worldSize
    const seed = [51360, 10783, 25248, 59674] // Random.getRandomSeed()

    // @TODO: Move this to $vm
    this.envState = {
      // @TODO: Support multiple scenes, and smooth switch
      // @values: isle | forest | tundra
      name: 'isle',
      waterCollectionName: "still-water-items",
      isBarrenGround: true,
      hasLakes: true,
      hasIce: false,
      width,
      height,
      bounds: [
        [-width / 2, -height / 2],
        [width / 2, height / 2]
      ],
      seed,
      module: this
    }

    const forestColors = [
      // Collection name
      { name: 'still-triangle-items', color: '#9D9166' },
      { name: 'still-dry-items', color: '#59622a' },
      { name: 'still-autumn-items', color: '#745C13' },
      { name: 'still-triangle-items', color: '#766D43' }
    ]

    const grasslandsColors = [
      { name: 'still-field-items', color: '#556325' },
      { name: 'still-yellow-items', color: '#8D7721' },
      { name: 'still-field-items', color: '#486b25' },
      { name: 'still-wet-items', color: '#605e41' }
    ]

    const tundraColors = [
      {
        name: 'still-ground-items',
        // color: "#797f84",
        color: '#2a3956'
      }
    ]

    this.envState.colors = this.groundColors = [
      // ...forestColors,
      // ...grasslandsColors,
      ...tundraColors
    ]
  }

  setupGrid() {
    const cellTileSize = 30
    const colorTileSize = 10

    this.grid = new EnvironmentGrid(
      this.random,
      this.groundColors,
      this.config.worldSize,
      cellTileSize,
      colorTileSize
    )
    // Will in env-grid module
    this.cellActiveDataList = []
  }

  setupLake() {
    this.lakeGroup = new THREE.Group()
    this.lakeGroup.name = 'lakeGroup'
    this.lakeGeo = generateLakeGeo(this.envState)

    this.envDataTextureMap = generateEnvDataTextureMap({
      ...this.envState,
      random: this.random,
      geo: this.lakeGeo,
      renderer: this.renderer,
      waterColors: [{ name: 'lake', color: this.config.brandHex }],
      groundColors: this.groundColors
    })

    this.lakeGeo.lakeInfos.map(lakeInfo => {
      const mesh = new EnvWaterPlaneObject({
        lakeInfo,
        hasIce: this.envState.hasIce,
        planeSize: this.config.worldSize,
        uniforms: {
          waterColor: {
            value: new THREE.Color(this.config.brandHex)
          },
          causticsMap: {
            value: this.asset.items[
              this.envState.hasIce ? 'iceCausticsTexture' : 'waterCausticsTexture'
            ]
          },
          distortMap: {
            value: this.asset.items.waterDistortTexture
          },
          ...this.getEnvDataTextureUniforms(),
          ...this.enviromentGround.getGroundUniforms(),
          ...this.enviromentTrace.getTraceUniforms()
        }
      })
      mesh.layers.set(RENDER_LAYERS.WATER)
      this.lakeGroup.add(mesh)

      this.envState.tokens = this.lakeGeo.tokens
    })
    // this.lakeGroup.children.map(mesh => (mesh.rotation.x = -Math.PI / 2))
    this.scene.add(this.lakeGroup)
  }

  setupSamples() {
    const { envState, lakeGeo, grid } = this
    this.samplesData = generateEnvSamples({
      envState, geo: lakeGeo, grid
    })

    Object.assign(this.envState, this.samplesData)
  }

  setupTerrain() {
    const terrainModel = this.asset.items.envTerrainModel.scene

    this.terrain = new EnvTerrainPlaneObject({
      terrainGeo: terrainModel.children[0].geometry,
      hasIce: this.lakeGeo.hasIce,
      planeScale: 1.2,
      planeSize: this.config.worldSize,
      heightMapTexture: this.asset.items.terrainHightmapTexture,
      uniforms: {
        floorMap: {
          value: this.asset.items.floorTexture
        },
        floorPathMap: {
          value: this.asset.items.floorPathTexture
        },
        floorOverlayMap: {
          value: this.asset.items.floorOverlayTexture
        },
        ...this.getEnvDataTextureUniforms(),
        ...this.enviromentTrace.getTraceUniforms()
      }
    })
    this.terrain.layers.set(RENDER_LAYERS.GROUND)
    this.scene.add(this.terrain)

    const quadGeo = new THREE.PlaneBufferGeometry(1, 1, 1, 1)
    quadGeo.rotateX(-Math.PI / 2)
    this.terrainDepth = new THREE.Mesh(
      quadGeo,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x163d84)
      })
    )
    this.terrainDepth.layers.set(RENDER_LAYERS.GROUND_DEPTH)
    this.terrainDepth.scale.set(this.config.worldSize, 1, this.config.worldSize)
    this.terrainDepth.position.y = -10
    this.terrainDepth.name = 'groundDepth'
    this.scene.add(this.terrainDepth)
  }

  setupOctopus() {
    this.octopus = this.asset.items.octopusModel.children[0]
    this.octopus.material = new THREE.MeshPhysicalMaterial({
      map: this.asset.items.octopusBaseTexture,
      transmission: 1,
      metalness: 0.2,
      color: new THREE.Color(0xffffff),
      transparent: true
    })
    this.octopus.scale.set(0.5, 0.5, 0.5)
    this.octopus.position.set(-5, -2, -0)
    this.scene.add(this.octopus)
  }

  setupPostUnderWaterDistort() {
    const maskTarget = new THREE.WebGLRenderTarget(
      this.config.width,
      this.config.height
    )
    maskTarget.texture.format = THREE.RGBFormat
    maskTarget.texture.minFilter = THREE.NearestFilter
    maskTarget.texture.magFilter = THREE.NearestFilter
    maskTarget.texture.generateMipmaps = false
    maskTarget.stencilBuffer = false

    // Setup post processing stage
    const mainTarget = this.renderer.module.postProcess.composer.renderTarget1
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const postMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        colorMap: { value: mainTarget.texture },
        maskMap: { value: maskTarget.texture },
        time: { value: 0 }
      }
    })
    const postPlane = new THREE.PlaneBufferGeometry(2, 2)
    const postQuad = new THREE.Mesh(postPlane, postMaterial)
    const postScene = new THREE.Scene()
    postScene.add(postQuad)
    postScene.postMaterial = postMaterial

    this.maskTarget = maskTarget
    this.postMaterial = postMaterial
    this.postScene = postScene
    this.postCamera = postCamera
  }

  getEnvDataTextureUniforms() {
    return {
      colorDataMap: {
        value: this.envDataTextureMap.colorDataTexture
      },
      biomeDataMap: {
        value: this.envDataTextureMap.biomeDataTexture
      },
      lakeDataMap: {
        value: this.envDataTextureMap.lakeDataTexture
      },
      lakeBlurDataMap: {
        value: this.envDataTextureMap.lakeBlurDataTexture
      },
      lakeHardDataMap: {
        value: this.envDataTextureMap.lakeHardDataTexture
      }
    }
  }

  isInsideLake(point) {
    if (!this.lakeGeo) {
      return
    }

    return insideWaterPolys(this.lakeGeo, point)
  }

  update(delta, elapsed) {
    this.lakeGroup.children.map(lake => (lake.uniforms.time.value += delta))
    // this.updatePostUnderWaterDistort(delta)
  }

  updatePostUnderWaterDistort(delta) {
    this.postMaterial.uniforms.time.value += delta

    // @FIXME: Remove the aliasing effect over water
    // @TODO: Move the post logic to renderer module
    this.lakeGroup.children.map(lake => (lake.uniforms.isMask.value = true))
    this.renderer.clear()
    this.renderer.setRenderTarget(this.maskTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)
    this.lakeGroup.children.map(lake => (lake.uniforms.isMask.value = false))
    this.renderer.module.render()
    if (this.renderer.module.usePostprocess) {
      this.renderer.render(this.postScene, this.postCamera)
    }
  }
}
