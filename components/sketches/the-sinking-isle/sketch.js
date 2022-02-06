import * as THREE from 'three'
import { Pane } from 'tweakpane'
import anime from 'animejs'

import { ModuleManager } from './engine/module'
import SizesManager from './engine/sizes'
import ControlManager from './engine/control'
import AudioManager from './engine/audio'
import StatsManager from './engine/stats'
import { asset } from './engine/asset'
import { Random, autobind, math } from './engine/utils'

import CameraModule from './modules/camera.module'
import TweenModule from './modules/tween.module'
import SubmitFrameModule from './modules/submit-frame.module'
import RendererModule from './modules/renderer.module'
import DOMRendererModule from './modules/dom-renderer.module'
import DOMSoundModule from './modules/dom-sound.module'
import EnviromentGround from './modules/enviroment-ground.module'
import EnviromentTraceDataTexutreModule from './modules/enviroment-trace.module'
import EnviromentTraceBubblesModule from './modules/enviroment-trace-bubbles.module'
import EnviromentModule from './modules/enviroment.module'
import EnviromentGridModule from './modules/enviroment-grid.module'
import EnviromentStillLifesModule from './modules/enviroment-still-lifes.module'
import EnviromentBuildingsModule from './modules/enviroment-buildings.module'
import AnimalFishShoalModule from './modules/animal-fish-shoal.module'
import AnimalMiscModule from './modules/animal-misc.module'
import PlayerModule from './modules/player.module'
import AtmosphereGlowDotsModule from './modules/atmosphere-glow-dots.module'
import AtmosphereRainModule from './modules/atmosphere-rain.module'
import AtmosphereWindModule from './modules/atmosphere-wind.module'
import ChapterModule from './modules/chapter.module'
import TestModule from './modules/test.module'

import assets from './assets'

import { cssVar } from '~/utils/color'
import { rafps } from './utils/fps'

const LOWEST_FPS = 2 // enable low FPS when dev UI
const HIGH_FPS = 60

const DEBUG_CHAPTER = null // 'suneBearHome'

class TheSinkingIsleSketch {
  constructor() {
    // Dev, Config
    this.config = {
      seed: Random.getRandomSeed(),
      debug: true,
      width: 1440,
      height: 900,
      pixelRatio: Math.min(Math.max(window.devicePixelRatio, 1), 2),
      worldSize: 256,
      lakeDepth: 100,
      fps: HIGH_FPS,
      brandHex: cssVar('--brand'),
      enablePlayground: false
    }
    this.debug = null
    this.stats = null

    // Renderer and Managers
    this.scene = new THREE.Scene()
    this.sizes = null
    this.camera = null
    this.renderer = null
    this.player = null
    this.time = this.clock = new THREE.Clock()
    this.asset = null
    this.audio = null
    this.module = new ModuleManager(this)
    this.control = null

    // DOM & State Machine
    this.container = null
    this.$vm = null

    // Utils
    this.random = Random(this.config.seed, 'Sketch')
  }

  async init({ container, $vm, config = {} }) {
    this.container = container
    this.$vm = $vm
    this.config = { ...this.config, ...config }

    // @FIXME: Current modules register order is strict
    // try to use DI to eliminate circular deps
    await this.loadAssets()
    this.setupEvents()
    this.setupAudio()
    this.setupDebug()
    this.setupTween()
    this.setupCamera()
    this.setupRenderer()
    this.setupEnviroment()
    this.setupPlayer()
    this.setupAnimal()
    this.setupOtherModules()

    this.resize()
    this.play()
  }

  async loadAssets() {
    this.asset = asset
    this.asset.loadAssets(assets)

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
    this.asset.on('error', error => {
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

    this.$vm.$watch('cachedContext.isMuteAudio', () => {
      if (this.$vm.cachedContext.isMuteAudio) {
        this.audio.mute()
      } else {
        this.audio.unmute()
      }
    })
  }

  setupAudio() {
    this.audio = new AudioManager(this.asset.getAudioItems())

    if (this.$vm.cachedContext.isMuteAudio) {
      this.audio.mute()
    }

    this.audio.unmute()

    this.module.add(DOMSoundModule)
  }

  setupTween() {
    this.tween = this.module.add(TweenModule)
  }

  setupDebug() {
    this.config.debug = this.$vm.enableDebug

    if (this.config.debug) {
      this.debug = new Pane()
      this.debug.containerElem_.style.width = '320px'
      // Replaced stats.js with tweakpane/plugin-essentials
      // this.stats = new StatsManager(false)
    }

    if (this.debug) {
      const folder = this.debug.addFolder({
        title: 'Dev',
        expanded: true
      })
      folder.addInput(this.config, 'enablePlayground').on('change', e => {
        if (this.config.enablePlayground) {
          this.module.add(TestModule)
        } else {
          this.module.remove(TestModule)
        }
      })
      folder.addInput(this.$vm, 'isPlaying')
      folder.addInput(this.$vm.cachedContext, 'isMuteAudio')
    }
  }

  setupCamera() {
    this.sizes = new SizesManager({
      container: this.container,
      onResize: this.resize
    })

    const cameraModule = this.module.add(CameraModule)
    this.camera = cameraModule.instance

    this.sizes.camera = this.camera
    setTimeout(() => {
      this.sizes.resize()
    })
  }

  setupRenderer() {
    const submitFrameModule = this.module.add(SubmitFrameModule)
    this.submitFrame = submitFrameModule
    this.module.set({ submitFrame: submitFrameModule })

    const rendererModule = this.module.add(RendererModule)
    this.renderer = rendererModule.instance
    this.control = new ControlManager(this.renderer.domElement, this.sizes)
    this.container.appendChild(this.renderer.domElement)

    this.module.set({ control: this.control })

    this.module.add(DOMRendererModule)
  }

  // @FIXME: Correct typo, enable spell checking
  setupEnviroment() {
    this.enviromentGround = this.module.add(EnviromentGround)
    this.enviromentTrace = this.module.add(EnviromentTraceDataTexutreModule)
    this.enviroment = this.module.add(EnviromentModule)

    this.module.add(EnviromentTraceBubblesModule)
    this.module.add(EnviromentGridModule)
    this.module.add(EnviromentStillLifesModule)
    this.module.add(EnviromentBuildingsModule)

    this.module.set({ enviroment: this.enviroment })
  }

  setupAnimal() {
    this.module.add(AnimalFishShoalModule)
    this.module.add(AnimalMiscModule)
  }

  setupPlayer() {
    const playerModule = this.module.add(PlayerModule)
    this.player = playerModule.instance
    this.module.set({ player: this.player })
  }

  async setupOtherModules() {
    this.module.add(AtmosphereGlowDotsModule)
    this.module.add(AtmosphereRainModule)
    this.module.add(AtmosphereWindModule)

    // Postload module
    this.asset.on('groupEnd', group => {
      if (group.name !== 'postload') {
        return
      }
      this.audio.setupPlayers(this.asset.getAudioItems())
      this.module.add(ChapterModule)
      if (this.config.enablePlayground) {
        this.module.add(TestModule)
      }
      if (DEBUG_CHAPTER) {
        this.$vm.currentChapter = DEBUG_CHAPTER
      }
    })
  }

  @autobind
  resize() {
    if (!this.container) {
      return
    }

    this.module.resize()
  }

  play() {
    if (!this.rafps) {
      this.rafps = rafps(this.update, this.config.fps)
    }
    this.rafps.play()
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
  update(frame) {
    if (!this.$vm.isPlaying) {
      return
    }

    const delta = 1 / this.config.fps
    // const delta = this.time.getDelta()
    // Clamp delta time for long frames
    this.delta = math.clamp(delta, 1 / 60, 1 / 20)
    this.time.elapsedTime += this.delta

    this.module.update(this.delta, this.time.elapsedTime, this.clock.oldTime)
    this.control.update(this.delta)
  }
}

export const theSinkingIsleSketch = new TheSinkingIsleSketch()
