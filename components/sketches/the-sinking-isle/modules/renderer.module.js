import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

import Module from '../engine/module'
import vertexShader from '../shaders/base.vert'
import fragmentShader from '../shaders/post-processing.frag'
import { RENDER_LAYERS } from '../utils/constants'

export default class Renderer extends Module {
  constructor(sketch) {
    super(sketch)

    this.usePostprocess = false

    if (this.debug) {
      this.debug.registerPlugin(EssentialsPlugin)
      this.debugFolder = this.debug.addFolder({
        title: 'Renderer',
        expanded: false
      })
      this.fpsGraph = this.debugFolder.addBlade({
        view: 'fpsgraph',
        label: 'fpsGraph'
      });
    }

    this.setInstance()
    this.setPostProcess()
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
      this.debugFolder
        .addInput(this, 'usePostprocess')
        .on('change', () => {
          this.postProcess.bloomComposer.renderTarget2.dispose()
        })
    }

    // Renderer
    this.instance = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true
    })
    this.instance.module = this
    this.instance.autoClear = false
    this.instance.domElement.style.position = 'absolute'
    this.instance.domElement.style.top = 0
    this.instance.domElement.style.left = 0
    this.instance.domElement.style.width = '100%'
    this.instance.domElement.style.height = '100%'

    // this.instance.setClearColor(0x414141, 1)
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
    // this.instance.toneMapping = THREE.ReinhardToneMapping
    // this.instance.toneMappingExposure = 2.3

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
        .on('change', () => {
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

    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = false

    // Bloom pass
    this.postProcess.unrealBloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.12,
      0.22,
      0.2
    )

    this.postProcess.unrealBloomPass.enabled = true

    if (this.debug) {
      const debugFolder = this.debugFolder.addFolder({
        title: 'UnrealBloomPass'
      })

      debugFolder.addInput(this.postProcess.unrealBloomPass, 'enabled', {})

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
    const RenderTargetClass =
      this.config.pixelRatio >= 2
        ? THREE.WebGLRenderTarget
        : THREE.WebGLMultisampleRenderTarget
    // const RenderTargetClass = THREE.WebGLRenderTarget
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
    this.postProcess.bloomComposer = new EffectComposer(
      this.instance,
      this.renderTarget
    )
    this.postProcess.bloomComposer.renderToScreen = false
    this.postProcess.bloomComposer.addPass(this.postProcess.renderPass)
    this.postProcess.bloomComposer.addPass(this.postProcess.unrealBloomPass)
    this.postProcess.bloomComposer.addPass(effectCopy)

    // Final Pass
    this.postProcess.finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: {
            value: this.postProcess.bloomComposer.renderTarget2.texture
          },
          enableGrayMode: {
            value: false
          }
        },
        vertexShader,
        fragmentShader
      }),
      'baseTexture'
    )
    this.postProcess.composer = new EffectComposer(
      this.instance,
      this.renderTarget
    )
    this.postProcess.composer.setSize(this.config.width, this.config.height)
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio)

    this.postProcess.composer.addPass(this.postProcess.renderPass)
    this.postProcess.composer.addPass(this.postProcess.finalPass)
    this.postProcess.composer.addPass(effectCopy)

    if (this.debug) {
      const debugFolder = this.debugFolder.addFolder({
        title: 'FinalPostProcessing'
      })

      debugFolder.addInput(
        this.postProcess.finalPass.uniforms.enableGrayMode,
        'value',
        { label: 'enableGrayMode' }
      )
    }
  }

  resize() {
    // Instance
    this.instance.setSize(this.config.width, this.config.height)
    this.instance.setPixelRatio(this.config.pixelRatio)

    // Post process
    this.postProcess.composer.setSize(this.config.width, this.config.height)
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio)
  }

  update(delta) {
    if (this.stats) {
      this.stats.beforeRender()
    }

    if (this.fpsGraph) {
      this.fpsGraph.begin()
    }

    this.submitFrame.preRender()

    this.instance.clear()
    if (this.usePostprocess) {
      // Render single layer
      this.camera.layers.set(RENDER_LAYERS.BLOOM)
      this.postProcess.bloomComposer.render()
      this.instance.clearDepth()
      // Render all layers
      this.camera.layers.enableAll()
      this.postProcess.composer.render()
    } else {
      this.instance.render(this.scene, this.camera)
    }

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

  destroy() {
    this.instance.renderLists.dispose()
    this.instance.dispose()
    this.renderTarget.dispose()
    this.postProcess.composer.renderTarget1.dispose()
    this.postProcess.composer.renderTarget2.dispose()
  }
}
