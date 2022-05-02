import * as THREE from 'three'
import gsap from 'gsap'
import Module from './base'

import { MainChapter } from './chapters/main.chapter'
import { SuneBearHomeChapter } from './chapters/sune-bear-home.chapter'
import { SnowfallSpaceChapter } from './chapters/snowfall-space.chapter'
import { TheOriginChapter } from './chapters/the-origin.chapter'

import postVertexShader from '../shaders/base.vert'
import postFragmentShader from '../shaders/post-chapter.frag'

export default class ChapterModule extends Module {
  constructor(sketch) {
    super(sketch)

    this.chapters = []
    this.lastChapter = this.$vm.currentChapter
    this.currentChapter = this.$vm.currentChapter
    this.isLocalDebug = this.$vm.$route.query.chapter && this.debug

    this.setupChapters()
    this.setupRender()
    this.listenEvents()

    this.resize()
  }

  get $lastChapter() {
    return this.chapters.find((el) => el.name === this.lastChapter)
  }

  get $currentChapter() {
    return this.chapters.find((el) => el.name === this.currentChapter)
  }

  setupRender() {
    // @TODO: Support multiple transitions & transition config for spec chapter
    const postUniforms = {
      intensity: {
        value: 1
      },

      time: { value: 0 },

      // @REF: https://tympanus.net/Development/webGLImageTransitions/index.html
      width: { value: 4 },
      scaleX: { value: 4.5 },
      scaleY: { value: 5 },

      resolution: {
        value: new THREE.Vector4(1, 1, 1, 1)
      },

      displacement: {
        value: this.asset.items.dispChapterTexture
      },

      texture1: {
        value: this.$currentChapter.renderTarget.texture
      },

      texture2: {
        value: this.$lastChapter.renderTarget.texture
      },

      progress: {
        value: 0
      }
    }

    const postSceneScale = 1
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
      uniforms: postUniforms
    })
    const postPlane = new THREE.PlaneBufferGeometry(
      2 * postSceneScale,
      2 * postSceneScale
    )
    const postQuad = new THREE.Mesh(postPlane, postMaterial)
    const postScene = new THREE.Scene()
    postScene.add(postQuad)

    this.postUniforms = postUniforms
    this.postScene = postScene
    this.postCamera = postCamera
  }

  setupChapters() {
    const chapterClasses = [
      MainChapter,
      SuneBearHomeChapter,
      SnowfallSpaceChapter,
      TheOriginChapter
    ]
    chapterClasses.map((Class) => {
      const ins = new Class({ sketch: this })
      this.chapters.push(ins)
    })
  }

  listenEvents() {
    this.$vm.$watch('currentChapter', () => {
      this.switchChapter(this.$vm.currentChapter)
    })
  }

  async switchChapter(chapter) {
    const lastChapter = this.currentChapter

    if (chapter === lastChapter) {
      return
    }

    if (!this.chapters.find((el) => el.name === chapter)) {
      console.warn(`Chapter: ${chapter} was invalid name`)
    }

    const duration = this.isLocalDebug ? 0.01 : 1

    this.$vm.isSwitchingChapter = true
    gsap.killTweensOf(this.postUniforms.progress)
    this.currentChapter = chapter
    this.lastChapter = lastChapter

    await this.$lastChapter.beforeLeave()
    await this.$currentChapter.beforeEnter()

    this.postUniforms.texture2.value = this.$currentChapter.renderTarget
    gsap.to(this.postUniforms.progress, {
      value: 1,
      duration,
      onComplete: () => {
        this.postUniforms.texture1.value = this.$currentChapter.renderTarget
        this.postUniforms.progress.value = 0
        this.$vm.isSwitchingChapter = false
        this.$lastChapter.afterLeft()
        this.$currentChapter.afterEntered()
      }
    })
  }

  resize() {
    const { width, height } = this.sizes
    this.renderer.setSize(width, height)
    this.chapters.map((el) => el.resize && el.resize(width, height))
  }

  update(delta, elapsed) {
    this.postUniforms.time.value += delta

    this.$currentChapter.update(delta, elapsed)
    if (
      this.currentChapter !== this.lastChapter &&
      this.$vm.isSwitchingChapter
    ) {
      this.$lastChapter.update(delta, elapsed)
    }
    this.updateRender()
  }

  updateRender() {
    if (this.currentChapter === 'main' && !this.$vm.isSwitchingChapter) {
      return
    }
    this.renderer.render(this.postScene, this.postCamera)
  }
}
