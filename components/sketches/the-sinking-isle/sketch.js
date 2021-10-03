import * as THREE from 'three'
import { Pane } from 'tweakpane'

import { ModuleManager } from './engine/module'
import SizesManager from './engine/sizes'
import AssetManager from './engine/asset'
import AudioManager from './engine/audio'
import StatsManager from './engine/stats'
import { Random, random } from './engine/utils'

import CameraModule from './modules/camera.module'
import RendererModule from './modules/renderer.module'
import EnviromentModule from './modules/enviroment.module'
import TestModule from './modules/test.module'

import assets from './assets'

class TheSinkingIsleSketch {

  constructor () {
    // Dev, Config
    this.config = {
      seed: Random.getRandomSeed(),
      debug: true,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(Math.max(window.devicePixelRatio, 1), 2)
    }
    this.debug = null
    this.states = null

    // Renderer and Managers
    this.scene = new THREE.Scene()
    this.camera = null
    this.renderer = null
    this.time = this.clock = new THREE.Clock()
    this.sizes = new SizesManager()
    this.asset = null
    this.audio = new AudioManager(this)
    this.module = new ModuleManager(this)

    // DOM & State Machine
    this.container = null
    this.$vm = null

    // Utils
    this.random = Random(this.config.seed)
  }

  async init({
    container, $vm, config = {}
  }) {
    this.container = container
    this.$vm = $vm
    this.config = { ...this.config, ...config }

    await this.loadAssets()
    this.listenEvents()
    this.setupDebug()
    this.setupCamera()
    this.setupRenderer()
    this.setupOtherModules()

    this.update()
  }

  listenEvents() {
    this.sizes.on('resize', () => {
      this.resize()
    })
  }

  async loadAssets() {
    this.asset = new AssetManager(assets)

    return new Promise((resolve, reject) => {
      this.asset.on('end', () => {
        resolve()
      })
      this.asset.on('error', (error) => {
        reject(error)
      })
    })
  }

  setupDebug() {
    this.config.debug = this.$vm.enableDebug

    if (this.config.debug) {
      this.debug = new Pane()
      this.debug.containerElem_.style.width = '320px'
      this.debug.containerElem_.style.zIndex = '3'
      this.states = new StatsManager(true)
    }
  }

  setupCamera() {
    const cameraModule = this.module.add(CameraModule)
    this.camera = cameraModule.instance
  }

  setupRenderer() {
    const rendererModule = this.module.add(RendererModule)
    this.renderer = rendererModule.instance

    this.container.appendChild(this.renderer.domElement)
  }

  setupOtherModules() {
    this.module.add(EnviromentModule)
    this.module.add(TestModule)
  }

  resize() {
    const boundings = this.container.getBoundingClientRect()
    this.config.width = boundings.width
    this.config.height = boundings.height

    this.module.resize()
  }

  update() {
    this.delta = this.time.getDelta()
    this.elapsed = this.time.oldTime

    this.module.update(this.delta, this.elapsed)

    if (this.$vm.isPlaying) {
      requestAnimationFrame(this.update.bind(this))
    }
  }

}

export const theSinkingIsleSketch = new TheSinkingIsleSketch()
