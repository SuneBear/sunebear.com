import * as THREE from 'three'
import Module from '../engine/module'

import { generateLakeGeo } from './enviroment/generate-env-lake-geo'
import { generateEnvDataTextureMap } from './enviroment/generate-env-data-textures'
import { EnvTerrainPlaneObject } from '../objects/env-terrain-plane.object'
import { EnvWaterPlaneObject } from '../objects/env-water-plane.object'

import { RENDER_LAYERS } from '../utils/constants'

import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/post-under-water-distort.frag'

// @TODO: Render world boundary
export default class Enviroment extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupScene()
    this.setupLake()
    this.setupTerrain()
    this.setupOctopus()
    this.setupPostUnderWaterDistort()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0xffffff)
  }

  setupLake() {
    const { worldSize } = this.config
    const width = worldSize
    const height = worldSize

    const geoConfig = {
      width,
      height,
      bounds: [
        [-width / 2, -height / 2],
        [width / 2, height / 2]
      ],
      seed: [23019, 20871, 29486, 37533]
    }

    this.lakeGroup = new THREE.Group()
    this.lakeGeo = generateLakeGeo(geoConfig)
    this.envDataTextureMap = generateEnvDataTextureMap({
      ...geoConfig,
      random: this.random,
      geo: this.lakeGeo,
      renderer: this.renderer,
      waterColors: [{ name: 'lake', color: this.config.brandHex }],
      groundColors: [
        { name: 'grasslands-items-field', color: '#556325' },
        { name: 'grasslands-items-yellow', color: '#8D7721' },
        { name: 'grasslands-items-field', color: '#486b25' },
        { name: 'grasslands-items-wet', color: '#605e41' }
      ]
    })

    this.lakeGeo.lakeInfos.map(lakeInfo => {
      const mesh = new EnvWaterPlaneObject({
        lakeInfo,
        planeSize: this.config.worldSize,
        uniforms: {
          waterColor: {
            value: new THREE.Color(this.config.brandHex)
          },
          causticsMap: {
            value: this.asset.items.waterNoiseTexture
          },
          distortMap: {
            value: this.asset.items.waterDistortTexture
          },
          ...this.getEnvDataTextureUniforms(),
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
      planeSize: this.config.worldSize * 2,
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
    // this.scene.add(this.terrain)
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
      lakeBlueDataMap: {
        value: this.envDataTextureMap.lakeBlueDataTexture
      },
      lakeHardDataMap: {
        value: this.envDataTextureMap.lakeHardDataTexture
      }
    }
  }

  update(delta, elapsed) {
    this.lakeGroup.children.map(lake => (lake.uniforms.time.value += delta))
    this.updatePostUnderWaterDistort(delta)
  }

  updatePostUnderWaterDistort(delta) {
    this.postMaterial.uniforms.time.value += delta

    // @TODO: Move the post logic to renderer module
    this.lakeGroup.children.map(lake => (lake.uniforms.isMask.value = true))
    this.renderer.clear()
    this.renderer.setRenderTarget(this.maskTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)
    this.lakeGroup.children.map(lake => (lake.uniforms.isMask.value = false))
    this.renderer.module.postProcess.composer.render()
    this.renderer.render(this.postScene, this.postCamera)
  }
}
