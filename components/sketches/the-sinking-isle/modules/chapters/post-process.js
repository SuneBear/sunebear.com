import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import vertexShader from '../../shaders/base.vert'
import fragmentShader from '../../shaders/post-processing.frag'
import { OutlineEffect } from '../../utils/hack-deps/three/outline-effect'
import { RENDER_LAYERS } from '../../utils/constants'

// @TODO: Replace renderer module post process
export const setupPostProcess = ({
  renderModule,
  renderTarget,
  scene,
  camera,
}) => {
  const renderer = renderModule.instance
  const o = {}

  o.composer = new EffectComposer(renderer)

  o.renderPass = new RenderPass(scene, camera)
  o.renderPass.renderToScreen = false

  o.effectCopy = new ShaderPass(CopyShader)

  o.fxaaPass = new ShaderPass(FXAAShader)

  o.unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(renderModule.sizes.width, renderModule.sizes.height),
    0.98,
    0.34,
    0.2
  )

  o.bloomComposer = new EffectComposer(renderer)
  o.bloomComposer.renderToScreen = false
  o.bloomComposer.addPass(o.renderPass)
  o.bloomComposer.addPass(o.unrealBloomPass)

  o.spriteShadowRenderTarget = new THREE.WebGLMultisampleRenderTarget(
    renderModule.sizes.width,
    renderModule.sizes.height,
    {
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      encoding: THREE.sRGBEncoding
    }
  )

  o.outlineRenderTarget = new THREE.WebGLMultisampleRenderTarget(
    renderModule.sizes.width,
    renderModule.sizes.height,
    {
      format: THREE.RGBFormat,
      encoding: THREE.sRGBEncoding
    }
  )

  o.outlineEffect = new OutlineEffect(renderer, {
    defaultThickness: 0,
    defaultColor: [ 0, 0, 0 ],
    defaultAlpha: 0,
    defaultKeepAlive: false
  })

  o.finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: { ...renderModule.postProcess.finalUniforms,
        shadowMap: {
          value: o.spriteShadowRenderTarget.texture
        },
        bloomMap: {
          value: o.bloomComposer.renderTarget2.texture
        },
        outlineMap: {
          value: o.outlineRenderTarget.texture
        },
        enableOutline: {
          value: true
        },
        enableGrainNoise: {
          value: true
        },
        enableLut: {
          value: false
        }
      },
      vertexShader,
      fragmentShader
    }),
    'map'
  )

  o.composer = new EffectComposer(renderer)
  o.composer.renderToScreen = false
  o.composer.setSize(renderModule.sizes.width, renderModule.sizes.height)
  o.composer.setPixelRatio(renderModule.config.pixelRatio)

  o.composer.addPass(o.renderPass)
  // o.composer.addPass(o.fxaaPass)
  o.composer.addPass(o.finalPass)
  o.composer.addPass(o.effectCopy)

  o.renderBloom = () => {
    if (renderModule.usePostprocess) {
      camera.layers.set(RENDER_LAYERS.BLOOM)
      o.bloomComposer.render()
      renderer.clearDepth()
      camera.layers.enableAll()
    }
  }

  o.renderOutline = () => {
    camera.layers.set(RENDER_LAYERS.OUTLINE)
    renderer.setRenderTarget(o.outlineRenderTarget)
    renderer.clear()
    o.outlineEffect.render(scene, camera)
    renderer.setRenderTarget(null)
    camera.layers.enableAll()
  }

  o.render = () => {
    renderer.clear()
    const oldBg = scene.background
    scene.background = null

    if (renderModule.usePostprocess) {
      o.renderBloom()
      o.renderOutline()
      scene.background = oldBg
      o.composer.render()
    } else {
      renderer.render(scene, camera)
    }
  }

  o.resize = () => {
    const { width, height } = renderModule.sizes
    const { pixelRatio } = renderModule.config
    const { fxaaPass, finalPass, composer } = o

    o.outlineRenderTarget.setSize(width, height)
    composer.setSize(width, height)

    fxaaPass.uniforms.resolution.x = 1 / (width * pixelRatio)
    fxaaPass.uniforms.resolution.y = 1 / (height * pixelRatio)
    finalPass.uniforms.resolution.value.set(width, height)
  }

  return o
}
