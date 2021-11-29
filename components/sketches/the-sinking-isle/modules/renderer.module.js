import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

import Module from '../engine/module'
import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/post-processing.frag'
import { RENDER_LAYERS } from '../utils/constants'

export default class Renderer extends Module {
  constructor(sketch) {
    super(sketch)

    this.usePostprocess = true

    if (this.debug) {
      this.debug.registerPlugin(EssentialsPlugin)
      this.debugFolder = this.debug.addFolder({
        title: 'Renderer',
        expanded: false
      })
      this.fpsGraph = this.debugFolder.addBlade({
        view: 'fpsgraph',
        label: 'fpsGraph'
      })
    }

    this.setInstance()
    this.setPostProcess()

    this.resize()
    if (!this.debug) {
      // @TODO: Optimize loading->scene transition
      this.setFadeInTransition({ delay: 0.1 })
    }
  }

  setInstance() {
    this.clearColor = '#000000'

    if (this.debug) {
      // this.debugFolder
      //   .addInput(this, 'clearColor', {
      //     view: 'color'
      //   })
      //   .on('change', () => {
      //     this.instance.setClearColor(this.clearColor, 1)
      //   })
      this.debugFolder.addInput(this, 'usePostprocess').on('change', () => {
        if (!this.usePostprocess) {
          this.postProcess.bloomComposer.renderTarget2.dispose()
        }
      })
    }

    // Renderer
    this.instance = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      stencil: false
    })
    this.instance.module = this
    this.instance.autoClear = false
    this.instance.domElement.style.position = 'absolute'
    this.instance.domElement.style.top = 0
    this.instance.domElement.style.left = 0
    this.instance.domElement.style.width = '100%'
    this.instance.domElement.style.height = '100%'

    this.instance.setClearColor(this.clearColor, 1)
    this.instance.setSize(this.config.width, this.config.height)
    this.instance.setPixelRatio(this.config.pixelRatio)

    this.instance.physicallyCorrectLights = true
    // this.instance.gammaOutPut = true
    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.autoUpdate = false
    this.instance.shadowMap.needsUpdate = this.instance.shadowMap.enabled
    this.instance.toneMapping = THREE.ReinhardToneMapping // THREE.LinearToneMapping

    this.context = this.instance.getContext()

    // Add stats panel
    if (this.stats) {
      this.stats.setRenderPanel(this.context)
    }

    // Debug
    if (this.debug) {
      this.debugFolder
        .addInput(this.instance.shadowMap, 'enabled', {
          label: 'shadowMapEnabled'
        })
        .on('change', ({ value }) => {
          this.postProcess.finalUniforms.enableShadow.value = value

          this.scene.traverse(_child => {
            if (_child instanceof THREE.Mesh) {
              _child.material.needsUpdate = true
            }
          })

          this.instance.shadowMap.needsUpdate = true
        })
    }
  }

  setPostProcess() {
    this.postProcess = {}

    /**
     * Render pass
     */
    // Render pass
    this.postProcess.renderPass = new RenderPass(this.scene, this.camera)
    this.postProcess.renderPass.clearColor = this.clearColor

    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = false

    // Bloom pass
    this.postProcess.unrealBloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.98,
      0.34,
      0.2
    )

    this.postProcess.unrealBloomPass.enabled = true

    if (this.debug) {
      const debugFolder = this.debugFolder.addFolder({
        title: 'UnrealBloomPass',
        expanded: false
      })

      // debugFolder.addInput(this.postProcess.unrealBloomPass, 'enabled', {})

      debugFolder.addInput(this.postProcess.unrealBloomPass, 'strength', {
        min: 0,
        max: 3,
        step: 0.001
      })

      debugFolder.addInput(this.postProcess.unrealBloomPass, 'radius', {
        min: 0,
        max: 1,
        step: 0.001
      })

      debugFolder.addInput(this.postProcess.unrealBloomPass, 'threshold', {
        min: 0,
        max: 1,
        step: 0.001
      })
    }

    /**
     * Effect composer
     */
    const RenderTargetClass = THREE.WebGLMultisampleRenderTarget
      ? THREE.WebGLRenderTarget
      : THREE.WebGLMultisampleRenderTarget
    this.renderTarget = new RenderTargetClass(
      this.config.width,
      this.config.height,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding
      }
    )
    this.postProcess.bloomComposer = new EffectComposer(this.instance)
    this.postProcess.bloomComposer.renderToScreen = false
    this.postProcess.bloomComposer.addPass(this.postProcess.renderPass)
    this.postProcess.bloomComposer.addPass(this.postProcess.unrealBloomPass)

    // Anti-Alias Pass
    this.postProcess.fxaaPass = new ShaderPass(FXAAShader)

    // Final Pass
    this.postProcess.finalUniforms = {
      baseTexture: { value: null },
      bloomTexture: {
        value: this.postProcess.bloomComposer.renderTarget2.texture
      },
      blueNoiseMap: {
        value: this.asset.items.blueNoiseTexture
      },
      shadowMap: {
        value: this.renderTarget.texture
      },
      lutMap: {
        value: this.asset.items.lutTexture
      },
      exposure: {
        value: this.instance.toneMappingExposure
      },
      fadeToClearColor: { value: new THREE.Color('#ffffff') },
      fadeToClearProgress: { value: this.debug ? 0 : 1 },
      resolution: {
        value: new THREE.Vector2(0, 0)
      },
      enableShadow: {
        value: this.instance.shadowMap.enabled
      },
      enableBloom: {
        value: true
      },
      enableVignette: {
        value: true
      },
      enableLut: {
        value: false
      },
      enableMono: {
        value: false
      }
    }
    this.postProcess.finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: this.postProcess.finalUniforms,
        vertexShader,
        fragmentShader
      }),
      'baseTexture'
    )
    this.postProcess.composer = new EffectComposer(
      this.instance
    )
    this.postProcess.composer.setSize(this.config.width, this.config.height)
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio)

    this.postProcess.composer.addPass(this.postProcess.renderPass)
    this.postProcess.composer.addPass(this.postProcess.finalPass)
    this.postProcess.composer.addPass(this.postProcess.fxaaPass)
    this.postProcess.composer.addPass(effectCopy)

    if (this.debug) {
      const debugFolder = this.debugFolder.addFolder({
        title: 'FinalPostProcessing'
      })

      debugFolder
        .addInput(this.postProcess.finalPass.uniforms.exposure, 'value', {
          label: 'exposure',
          min: 0,
          max: 2
        })
        .on('change', ({ value }) => {
          this.instance.toneMappingExposure = Math.pow(value, 4.0)
          this.postProcess.finalPass.uniforms.exposure.value = Math.pow(
            value,
            4.0
          )
        })

      debugFolder.addInput(
        this.postProcess.finalPass.uniforms.enableBloom,
        'value',
        { label: 'enableBloom' }
      )
      debugFolder.addInput(
        this.postProcess.finalPass.uniforms.enableVignette,
        'value',
        { label: 'enableVignette' }
      )
      debugFolder.addInput(
        this.postProcess.finalPass.uniforms.enableLut,
        'value',
        { label: 'enableLut' }
      )
      debugFolder.addInput(
        this.postProcess.finalPass.uniforms.enableMono,
        'value',
        { label: 'enableMono' }
      )
    }
  }

  resize() {
    const { width, height, pixelRatio } = this.config

    // Instance
    this.instance.setSize(width, height)
    this.instance.setPixelRatio(pixelRatio)

    // Post process
    const { fxaaPass, finalUniforms, composer } = this.postProcess
    composer.setSize(width, height)
    composer.setPixelRatio(pixelRatio)

    fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio)
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio)

    finalUniforms.resolution.value.set(width, height)
  }

  // @TODO: Use a better way to draw shadows
  renderShadows() {
    if (!this.instance.shadowMap.enabled) {
      return
    }

    // this.camera.layers.disable(RENDER_LAYERS.GROUND)
    // this.camera.layers.disable(RENDER_LAYERS.GROUND_DEPTH)
    // this.camera.layers.disable(RENDER_LAYERS.WATER)
    this.camera.layers.set(RENDER_LAYERS.SHADOW)

    // Draw shadows
    this.scene.traverseVisible(child => {
      const { userData } = child
      if (userData.shadowCaster) {
        child.layers.enable(RENDER_LAYERS.SHADOW)
        userData.__material = child.material
        userData.__materialDepthTest = child.material.depthTest
        userData.__materialDepthWrite = child.material.depthWrite
        userData.__materialBlending = child.material.blending
        userData.__materialTransparent = child.material.transparent
        if (userData.__shadowMaterial) {
          child.material = userData.__shadowMaterial
        }
        child.material.depthTest = true
        child.material.depthWrite = false
        child.material.transparent = true
        // child.material.blending = THREE.AdditiveBlending
        if (child.material.uniforms && child.material.uniforms.silhouette) {
          child.material.uniforms.silhouette.value = true
        }
      }
    })

    this.instance.setRenderTarget(this.renderTarget)
    this.instance.render(this.scene, this.camera)
    this.instance.setRenderTarget(null)

    // Recover normal
    this.scene.traverseVisible(child => {
      const { userData } = child
      if (userData.shadowCaster) {
        child.material = child.userData.__material
        child.material.depthWrite = child.userData.__materialDepthTest
        child.material.depthTest = child.userData.__materialDepthWrite
        child.material.transparent = child.userData.__materialTransparent
        child.material.blending = child.userData.__materialBlending

        if (child.material.uniforms && child.material.uniforms.silhouette) {
          child.material.uniforms.silhouette.value = false
        }
      }
    })

    this.camera.layers.enableAll()
  }

  render() {
    this.renderShadows()

    if (this.usePostprocess) {
      this.postProcess.composer.render()
    } else {
      this.instance.render(this.scene, this.camera)
    }
  }

  update(delta) {
    if (this.stats) {
      this.stats.beforeRender()
    }

    if (this.fpsGraph) {
      this.fpsGraph.begin()
    }

    this.submitFrame.preRender()

    // Main renderer
    this.instance.clear()
    if (this.usePostprocess) {
      // Render single layer
      this.camera.layers.set(RENDER_LAYERS.BLOOM)
      this.postProcess.bloomComposer.render()
      this.instance.clearDepth()
      // Render all layers
      this.camera.layers.enableAll()
    }
    this.render()

    // Let's assume frame tasks should always happen
    const task = this.submitFrame.nextFrameTask()
    if (task) task(delta)

    this.submitFrame.postRender()

    if (this.stats) {
      this.stats.afterRender()
    }

    if (this.fpsGraph) {
      this.fpsGraph.end()
    }
  }

  setFadeInTransition(options) {
    this.tween.add({
      target: this.postProcess.finalUniforms.fadeToClearProgress,
      value: [1, 0],
      duration: 1,
      easing: 'easeInOutSine',
      ...options
    })
  }

  destroy() {
    this.instance.renderLists.dispose()
    this.instance.dispose()
    this.renderTarget.dispose()
    this.postProcess.composer.renderTarget1.dispose()
    this.postProcess.composer.renderTarget2.dispose()
  }
}
