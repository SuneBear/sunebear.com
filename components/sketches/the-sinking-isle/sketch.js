import * as THREE from 'three'
import { Pane } from 'tweakpane'
import anime from 'animejs'

import { ModuleManager } from './engine/module'
import SizesManager from './engine/sizes'
import AssetManager from './engine/asset'
import ControlManager from './engine/control'
import AudioManager from './engine/audio'
import StatsManager from './engine/stats'
import { Random, autobind, math } from './engine/utils'

import CameraModule from './modules/camera.module'
import SubmitFrameModule from './modules/submit-frame.module'
import RendererModule from './modules/renderer.module'
import PlayerModule from './modules/player.module'
import EnviromentModule from './modules/enviroment.module'
import EnviromentTraceDataTexutreModule from './modules/enviroment-trace.module'
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
      worldSize: 100,
      enablePlayground: false
    }
    this.debug = null
    this.stats = null

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
    this.setupEnviroment()
    this.setupOtherModules()

    this.play()
  }

  async loadAssets() {
    this.asset = new AssetManager(assets)

    this.asset.on('progress', () => {
      if (this.progressAnimer) {
        this.progressAnimer.pause()
      }
      this.progressAnimer = anime({
        targets: this.$vm,
        easing: 'linear',
        duration: 3000,
        loadProgress: this.asset.getLoadPreogress()
      })
    })
    this.asset.on('error', (error) => {
      console.log('Asset error', error)
    })

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
      // Replaced stats.js with tweakpane/plugin-essentials
      this.stats = new StatsManager(false)
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
    const submitFrameModule = this.module.add(SubmitFrameModule)
    this.submitFrame = submitFrameModule
    this.module.set({ submitFrame: submitFrameModule })

    const rendererModule = this.module.add(RendererModule)
    this.renderer = rendererModule.instance
    this.control = new ControlManager(this.renderer.domElement)
    this.container.appendChild(this.renderer.domElement)
  }

  setupPlayer() {
    const playerModule = this.module.add(PlayerModule)
    this.player = playerModule.instance
    this.module.set({ player: this.player })
  }

  setupEnviroment() {
    this.enviromentTrace = this.module.add(EnviromentTraceDataTexutreModule)
    this.enviroment = this.module.add(EnviromentModule)
  }

  setupOtherModules() {
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
    // const delta = this.time.getDelta()
    const delta = 1 / 40
    // Clamp delta time for long frames
    this.delta = math.clamp(delta, 1 / 40, 1 / 20)
    this.time.elapsedTime += this.delta

    this.module.update(this.delta, this.time.elapsedTime, this.clock.oldTime)

    if (this.$vm.isPlaying) {
      requestAnimationFrame(this.update)
    }
  }

}

export const theSinkingIsleSketch = new TheSinkingIsleSketch()
