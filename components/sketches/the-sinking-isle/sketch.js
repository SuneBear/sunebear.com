import * as THREE from 'three'
import { Pane } from 'tweakpane'
import anime from 'animejs'

import { ModuleManager } from './engine/module'
import SizesManager from './engine/sizes'
import ControlManager from './engine/control'
import AudioManager from './engine/audio'
import StatsManager from './engine/stats'
import { asset } from './engine/asset'
import { Random, autobind, math, sleep } from './engine/utils'

import CameraModule from './modules/camera.module'
import TweenModule from './modules/tween.module'
import SubmitFrameModule from './modules/submit-frame.module'
import RendererModule from './modules/renderer.module'
import DOMRendererModule from './modules/dom-renderer.module'
import DOMSoundModule from './modules/dom-sound.module'
// import EnviromentGround from './modules/enviroment-ground.module'
import EnviromentTraceDataTextureModule from './modules/enviroment-trace.module'
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
      width: 1440,
      height: 900,
      pixelRatio: math.clamp(window.devicePixelRatio, 1, 1.5),
      worldSize: 256,
      lakeDepth: 100,
      fps: HIGH_FPS,
      brandHex: cssVar('--brand'),
      debug: undefined,
      stats: false,
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

    // @Dev: Only play single module
    // this.module.pause()
    // this.module.get(RendererModule).play()
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

    this.module.add(DOMSoundModule)
  }

  setupTween() {
    this.tween = this.module.add(TweenModule)
  }

  async setupDebug() {
    this.config.debug = this.$vm.enableDebug
    this.config.stats = this.$vm.enableStats

    if (this.config.debug) {
      this.debug = new Pane()
      this.debug.containerElem_.style.width = '320px'
      // Replaced stats.js with tweakpane/plugin-essentials
      if (this.config.stats) {
        this.stats = new StatsManager(true)
      } else {
        this.debug.containerElem_.style.display = 'none'
      }
    }

    if (this.debug) {
      const folder = this.debug.addFolder({
        title: 'Dev',
        expanded: false
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
      this.debug.dev = folder
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
    this.container.appendChild(this.renderer.domElement)
    this.control = new ControlManager(this.renderer.domElement, this.sizes)

    this.module.set({ control: this.control })

    const domRendererModule = this.module.add(DOMRendererModule)
    this.domRenderer = domRendererModule.instance
  }

  // @FIXME: Correct typo, enable spell checking
  setupEnviroment() {
    // this.enviromentGround = this.module.add(EnviromentGround)
    this.enviromentTrace = this.module.add(EnviromentTraceDataTextureModule)
    this.enviroment = this.module.add(EnviromentModule)

    this.module.add(EnviromentTraceBubblesModule)
    this.module.add(EnviromentGridModule)
    this.module.add(EnviromentStillLifesModule)
    this.module.add(EnviromentBuildingsModule)

    this.module.set({ enviroment: this.enviroment })
  }

  setupPlayer() {
    const playerModule = this.module.add(PlayerModule)
    this.player = playerModule.instance
    this.module.set({ player: this.player })
  }

  setupAnimal() {
    this.module.add(AnimalFishShoalModule)
    this.module.add(AnimalMiscModule)
  }

  async setupOtherModules() {
    this.module.add(AtmosphereGlowDotsModule)
    this.module.add(AtmosphereRainModule)
    this.module.add(AtmosphereWindModule)

    // Postload module
    this.asset.on('groupEnd', async group => {
      if (group.name !== 'postload') {
        return
      }

      this.audio.setupPlayers(this.asset.getAudioItems())

      const modules = await Promise.all([
        import('./modules/building-spark-wish-beacon.module'),
        import('./modules/chapter.module')
      ])
      modules.map(el => this.module.add(el.default))

      if (this.config.enablePlayground) {
        this.module.add(TestModule)
      }

      if (DEBUG_CHAPTER || this.$vm.$route.query.chapter) {
        this.$vm.currentChapter = DEBUG_CHAPTER || this.$vm.$route.query.chapter
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
    // @TODO: Destroy the sketch
  }

  @autobind
  update(delta, frame) {
    if (!this.$vm.isPlaying) {
      return
    }

    // delta = 1 / this.config.fps
    // delta = this.time.getDelta()

    // Clamp delta time for long frames
    this.delta = math.clamp(delta, 1 / 120, 1 / 10)
    this.time.elapsedTime += this.delta

    this.module.update(this.delta, this.time.elapsedTime, this.clock.oldTime)
    this.control.update(this.delta)
  }
}

export const theSinkingIsleSketch = new TheSinkingIsleSketch()
