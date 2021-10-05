import * as THREE from 'three'
import { Pane } from 'tweakpane'

import { ModuleManager } from './engine/module'
import SizesManager from './engine/sizes'
import AssetManager from './engine/asset'
import ControlManager from './engine/control'
import AudioManager from './engine/audio'
import StatsManager from './engine/stats'
import { Random, autobind, random } from './engine/utils'

import CameraModule from './modules/camera.module'
import RendererModule from './modules/renderer.module'
import PlayerModule from './modules/player.module'
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
      pixelRatio: Math.min(Math.max(window.devicePixelRatio, 1), 2),
      worldSize: 4,
      enablePlayground: true
    }
    this.debug = null
    this.states = null

    // Renderer and Managers
    this.scene = new THREE.Scene()
    this.camera = null
    this.renderer = null
    this.player = null
    this.time = this.clock = new THREE.Clock()
    this.sizes = new SizesManager({
      onResize: this.resize
    })
    this.asset = null
    this.audio = null
    this.module = new ModuleManager(this)
    this.control = null

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
    this.setupEvents()
    this.setupAudio()
    this.setupDebug()
    this.setupCamera()
    this.setupRenderer()
    this.setupPlayer()
    this.setupOtherModules()

    this.play()
  }

  async loadAssets() {
    this.asset = new AssetManager(assets)

    await this.asset.load()
  }

  setupEvents() {
    this.$vm.$watch('isPlaying', () => {
      if (this.$vm.isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    })

    this.$vm.$watch('isMuteAudio', () => {
      if (this.$vm.isMuteAudio) {
        this.audio.mute()
      } else {
        this.audio.unmute()
      }
    })
  }

  setupAudio() {
    this.audio = new AudioManager(this.asset.getAudioItems())

    if (this.$vm.isMuteAudio) [
      this.audio.mute()
    ]
  }

  setupDebug() {
    this.config.debug = this.$vm.enableDebug

    if (this.config.debug) {
      this.debug = new Pane()
      this.debug.containerElem_.style.width = '320px'
      this.debug.containerElem_.style.zIndex = '3'
      this.states = new StatsManager(true)
    }

    if (this.debug) {
      const folder = this.debug.addFolder({
        title: 'Dev',
        expanded: true
      })
      folder.addInput(this.config, 'enablePlayground').on('change', (e) => {
        if (this.config.enablePlayground) {
          this.module.add(TestModule)
        } else {
          this.module.remove(TestModule)
        }
      })
      folder.addInput(this.$vm, 'isPlaying')
      folder.addInput(this.$vm, 'isMuteAudio')
    }
  }

  setupCamera() {
    const cameraModule = this.module.add(CameraModule)
    this.camera = cameraModule.instance
  }

  setupRenderer() {
    const rendererModule = this.module.add(RendererModule)
    this.renderer = rendererModule.instance
    this.control = new ControlManager(this.renderer.domElement)
    this.container.appendChild(this.renderer.domElement)
  }

  setupPlayer() {
    const playerModule = this.module.add(PlayerModule)
    this.player = playerModule.instance
  }

  setupOtherModules() {
    this.module.add(EnviromentModule)
    if (this.config.enablePlayground) {
      this.module.add(TestModule)
    }
  }

  @autobind
  resize() {
    if (!this.container) {
      return
    }

    const boundings = this.container.getBoundingClientRect()
    this.config.width = boundings.width
    this.config.height = boundings.height

    this.module.resize()
  }

  play() {
    this.update()
    this.module.play()
    this.audio.resume()
  }

  pause() {
    this.audio.pause()
    this.module.pause()
  }

  stop() {
    this.module.stop()
  }

  @autobind
  update() {
    this.delta = this.time.getDelta()

    this.module.update(this.delta, this.time.elapsedTime, this.clock.oldTime)

    if (this.$vm.isPlaying) {
      requestAnimationFrame(this.update)
    }
  }

}

export const theSinkingIsleSketch = new TheSinkingIsleSketch()
