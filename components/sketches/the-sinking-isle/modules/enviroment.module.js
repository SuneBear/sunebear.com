import * as THREE from 'three'
import Module from '../engine/module'

import { EnvWaterPlaneObject } from '../objects/env-water-plane.object'

import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/post-under-water-distort.frag'

// @TODO: Render world boundary
export default class Enviroment extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupScene()
    this.setupWater()
    this.setupOctopus()
    this.setupPostUnderWaterDistort()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0xffffff)
  }

  setupWater() {
    this.water = new EnvWaterPlaneObject({
      planeSize: this.config.worldSize * 2,
      uniforms: {
        causticsMap: {
          value: this.asset.items.waterNoiseTexture
        },
        distortMap: {
          value: this.asset.items.waterDistortTexture
        },
        ...this.enviromentTrace.getTraceUniforms()
      }
    })
    this.scene.add(this.water)
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

  update(delta, elapsed) {
    this.water.uniforms.time.value += delta
    this.updatePostUnderWaterDistort(delta)
  }

  updatePostUnderWaterDistort(delta) {
    this.postMaterial.uniforms.time.value += delta

    // @TODO: Move the post logic to renderer module
    this.water.material.uniforms.isMask.value = true
    this.renderer.clear()
    this.renderer.setRenderTarget(this.maskTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)
    this.water.material.uniforms.isMask.value = false
    this.renderer.module.postProcess.composer.render()
    this.renderer.render(this.postScene, this.postCamera)
  }
}
