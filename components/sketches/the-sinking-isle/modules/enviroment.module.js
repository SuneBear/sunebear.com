import * as THREE from 'three'
import Module from '../engine/module'

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
    this.setupLake()
    this.setupTerrain()
    // this.setupOctopus()
    this.setupPostUnderWaterDistort()
  }

  setupScene() {
    // @TODO: Support multiple scenes
    // @values: lake | forest | tundra
    this.name = 'lake'
    this.scene.background = new THREE.Color(0x000000)
  }

  setupLake() {
    const { worldSize } = this.config

    const hasIce = false
    const width = worldSize
    const height = worldSize
    const seed = [51360, 10783, 25248, 59674] // Random.getRandomSeed()

    const geoConfig = {
      hasIce,
      width,
      height,
      bounds: [
        [-width / 2, -height / 2],
        [width / 2, height / 2]
      ],
      seed
    }

    const forestColors = [
      { name: 'forest-items-triangle', color: '#9D9166' },
      { name: 'forest-items-dry', color: '#59622a' },
      { name: 'forest-items-autumn', color: '#745C13' },
      { name: 'forest-items-triangle', color: '#766D43' }
    ]

    const grasslandsColors = [
      { name: 'grasslands-items-field', color: '#556325' },
      { name: 'grasslands-items-yellow', color: '#8D7721' },
      { name: 'grasslands-items-field', color: '#486b25' },
      { name: 'grasslands-items-wet', color: '#605e41' }
    ]

    const tundraColors = [
      {
        name: 'tundra-items-basic',
        // color: "#797f84",
        color: '#2a3956'
      }
      // { name: "tundra-items-basic", color: "#898e91" },
      // { name: "tundra-items-snow", color: "#d9d9d9" },
      // { name: "grasslands-field", color: "#5a823a" },
      // { name: "grasslands-yellow", color: "#8D7721" },
    ]

    this.lakeGroup = new THREE.Group()
    this.lakeGroup.name = 'lakeGroup'
    this.lakeGeo = generateLakeGeo(geoConfig)
    this.envDataTextureMap = generateEnvDataTextureMap({
      ...geoConfig,
      random: this.random,
      geo: this.lakeGeo,
      renderer: this.renderer,
      waterColors: [{ name: 'lake', color: this.config.brandHex }],
      groundColors: [
        // ...forestColors,
        // ...grasslandsColors,
        ...tundraColors
      ]
    })

    this.lakeGeo.lakeInfos.map(lakeInfo => {
      const mesh = new EnvWaterPlaneObject({
        lakeInfo,
        hasIce,
        planeSize: this.config.worldSize,
        uniforms: {
          waterColor: {
            value: new THREE.Color(this.config.brandHex)
          },
          causticsMap: {
            value: this.asset.items[
              hasIce ? 'iceCausticsTexture' : 'waterCausticsTexture'
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
      mesh.layers.enable(RENDER_LAYERS.WATER)
      this.lakeGroup.add(mesh)
    })
    // this.lakeGroup.children.map(mesh => (mesh.rotation.x = -Math.PI / 2))
    this.scene.add(this.lakeGroup)
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
