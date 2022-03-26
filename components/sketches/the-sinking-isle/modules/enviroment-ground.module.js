import * as THREE from 'three'

import Module from './base'
import { RENDER_LAYERS } from '../utils/constants'

// Getting only ground render texture
export default class EnviromentGround extends Module {
  constructor(sketch) {
    super(sketch)

    this.renderTargetSize = 256
    const renderTarget = new THREE.WebGLRenderTarget(this.renderTargetSize, this.renderTargetSize)
    renderTarget.depthBuffer = false
    renderTarget.texture.generateMipmaps = false
    renderTarget.texture.minFilter = THREE.LinearFilter
    renderTarget.texture.magFilter = THREE.LinearFilter
    renderTarget.texture.wrapS = renderTarget.texture.wrapT =
      THREE.ClampToEdgeWrapping

    this.clearColor = new THREE.Color(1, 1, 1)
    this.tmpColor = new THREE.Color()
    this.projectionMatrix = new THREE.Matrix4()
    this.renderTarget = renderTarget

    this.submitFrame.addPreRenderCallback(() => this.submitPreRender())
  }

  getGroundUniforms() {
    return {
      groundMap: {
        value: this.renderTarget.texture
      },
      groundProjectionMatrix: {
        value: this.projectionMatrix
      }
    }
  }

  resize() {
    const { renderTarget, renderer } = this

    const canvas = renderer.domElement
    const width = canvas.width
    const height = canvas.height
    if (canvas.width === 0 || canvas.height === 0) return

    let newAspect = width / height
    const rWidth = this.renderTargetSize
    const rHeight = Math.round(rWidth / newAspect)
    if (renderTarget.width !== rWidth || renderTarget.height !== rHeight) {
      renderTarget.setSize(rWidth, rHeight)
    }
  }

  submitPreRender() {
    const mainCamera = this.camera
    const mainScene = this.scene
    const renderer = this.renderer
    const renderTarget = this.renderTarget
    const terrain = this.enviroment?.terrain

    if (!terrain) {
      return
    }

    // @TODO: Support postComposer renderTarget
    this.projectionMatrix.copy(mainCamera.projectionMatrix)
    terrain.uniforms.isRenderTarget.value = true
    mainCamera.layers.disableAll()
    mainCamera.layers.enable(RENDER_LAYERS.GROUND)
    mainCamera.layers.disable(RENDER_LAYERS.GROUND_ELEMENTS)
    mainCamera.layers.disable(RENDER_LAYERS.GROUND_DEPTH)
    renderer.getClearColor(this.tmpColor)
    renderer.setRenderTarget(renderTarget)
    renderer.setClearColor(this.clearColor)
    renderer.clear()
    renderer.render(mainScene, mainCamera)
    renderer.setRenderTarget(null)
    terrain.uniforms.isRenderTarget.value = false
    renderer.setClearColor(this.tmpColor)
    mainCamera.layers.enableAll()
  }
}
