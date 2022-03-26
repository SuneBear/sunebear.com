import * as THREE from 'three'
import gsap from 'gsap'
import { Chapter } from './base'
import { setupPostProcess } from './post-process'
import { math } from '../../engine/utils'
import { SceneObjectInteractionSystem } from '../../objects/object-interaction-system'
import { BuildingGroupObject } from '../../objects/building.object'
import { AttentionIndicatorObject } from '../../objects/vue-2d.object'
import { convertToToonMaterial } from '../../objects/mesh-toon.material'
import { OrbitControls } from '../../utils/hack-deps/three/orbit-controls'
import { emitClickEffect } from '~/components/uxs/click-effect'
const IS_IN_PROGRESS = true

export class SuneBearHomeChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'suneBearHome'

    this.setupRender()
    this.setupLight()
    this.setupModel()
    this.setupTransition()
    this.setupEvents()
    // this.setupTest()
  }

  setupRender() {
    this.scene.background = new THREE.Color(0xe29b75)
    this.camera.position.set(1, 4, 4)
    this.camera.zoom = 1.5
    this.camera.lookAt(0, 0, 0)

    this.postProcess = setupPostProcess({
      renderModule: this.renderer.module,
      renderTarget: this.renderTarget,
      scene: this.scene,
      camera: this.camera
    })

    this.renderTarget = this.postProcess.composer.renderTarget1

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.module.container
    )
    this.controls.enabled = false

    this.controls.minZoom = 0.5
    this.controls.maxZoom = 4
    this.controls.maxPolarAngle = THREE.Math.degToRad(90 - 10)
    this.controls.minPolarAngle = THREE.Math.degToRad(20)
  }

  setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)
    this.scene.add(ambientLight)
    const directionLight = this.sketch.enviroment.directionLight.clone()
    this.scene.add(directionLight)
  }

  // @FIXME: Remove outline aliasing
  setupModel() {
    let i = 0
    this.model = new BuildingGroupObject({
      model: this.sketch.asset.items.chapterSuneBearHomeModel,
      name: 'suneBearHome',
      waterBuoyancyIntensity: 2,
      onModelSetup: (obj) => {
        // @FIXME: Resolve z-fighting in safari
        if (this.sketch.$vm.isSafari) {
          obj.material.depthTest = false
          obj.renderOrder = i
        }
        if (obj.name === 'floor') {
          obj.renderOrder = -100
          obj.material.depthTest = false
          obj.material.emissiveIntensity = 0.10
        }
      },
      materialOptions: {
        castShadow: false,
        outlineThickness: 0.006,
        emissiveIntensity: 0.03
      }
    })

    this.model.position.z = 0.1
    this.model.position.x = -0.1

    this.scene.add(this.model)
  }

  setupTransition() {
    this.progress = 0

    this.progressFadeIn = gsap.fromTo(this, { progress: 0 }, {
      progress: 1,
      duration: 2,
      delay: 0.25,
      paused: true,
      overwrite: true,
      onComplete: () => {
        this.startOnboarding()
      }
    })

    this.progressFadeOut = gsap.fromTo(this, { progress: 1 }, {
      progress: 0,
      duration: 1,
      delay: 0.15,
      paused: true,
      overwrite: true
    })

    this.progressTransition = gsap.timeline()
    this.progressTransition
      .fromTo(this.model.children[0].position,
        { y: -5 },
        { y: 0 }
      )
      .fromTo(this.model.children[0].scale,
        { x: 0.6, y: 0.6, z: 0.6 },
        { x: 1, y: 1, z: 1 },
        '>-50%'
      )
  }

  setupTest() {
    const geometry = new THREE.BoxGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xbb0000 })
    const cube = new THREE.Mesh( geometry, material )
    convertToToonMaterial(cube, {
      outlineThickness: 0,
      outlineColor: 0x000000
    })
    this.scene.add(cube)
  }

  setupEvents() {
    this.sceneObjectInteractionSystem = new SceneObjectInteractionSystem({
      scene: this.scene,
      camera: this.camera,
      control: this.sketch.control
    })

    const cear = this.scene.getObjectByName('sleepingcat2')
    const box = this.scene.getObjectByName('box')

    const clickCearEffect = (event) => {
      emitClickEffect({
        type: 'text',
        text: ['🍤', '🧶', '😻', '💤', '🌿'],
        x: event.x,
        y: event.y
      })
    }

    cear.onPointerOver = () => {
      cear.scale.set(1.05, 1.05, 1.05)
    }
    cear.onPointerOut = () => {
      cear.scale.set(1, 1, 1)
    }
    cear.onClick = (cursor) => {
      if (!this.$vm.cachedContext.hasIntroducedCear) {
        this.$vm.$story.add({
          message: this.$vm.$t('story.bear.suneBearHome.cearIntro')
        })
        this.$vm.cachedContext.hasIntroducedCear = true
      }
      clickCearEffect(cursor)
    }

    box.add(new AttentionIndicatorObject({
      animation: null,
      icon: 'lock-2-fill',
      onClick: () => {
        this.$vm.$message.error(this.$vm.$t('tsi.chapter-shb.needKey'))
      }
    }))
  }

  beforeEnter() {
    super.beforeEnter()
    this.sceneObjectInteractionSystem.play()
    this.progressFadeIn.restart(true)
  }

  beforeLeave() {
    super.beforeLeave()
    this.sceneObjectInteractionSystem.pause()
    this.progressFadeOut.restart(true)
  }

  startOnboarding() {
    if (!this.$vm.cachedContext.hasVisitedSuneBearHome) {
      if (IS_IN_PROGRESS) {
        this.$vm.$story.add({
          user: 'bear',
          message: this.$vm.$t('story.bear.suneBearHome.inProgress')
        })
      } else {
        // @TODO
      }
      this.$vm.cachedContext.hasVisitedSuneBearHome = true
    }
  }

  resize() {
    const zoom = this.sketch.sizes.viewport.width / (this.sketch.config.width * 0.4)
    this.camera.zoom = math.clamp(zoom, 0.5, 1.5)
    super.resize()
    this.postProcess.resize()
  }

  update(delta) {
    super.update()
    this.progressTransition.progress(this.progress)
    this.updateModel(delta)
    this.updateControl()
    this.updateRender()
  }

  updateModel(delta) {
    this.model.update(delta)
    this.model.position.y = 0
  }

  updateControl() {
    this.camera.updateMatrixWorld()
    this.camera.updateProjectionMatrix()
    this.controls.update()
  }

  updateRender() {
    const { renderer } = this

    if (renderer.module.usePostprocess) {
      const lastToneMappingExposure = renderer.toneMappingExposure
      renderer.toneMappingExposure = 5
      this.postProcess.render()
      renderer.toneMappingExposure = lastToneMappingExposure
    } else {
      renderer.setRenderTarget(this.renderTarget)
      renderer.clear()
      renderer.render(this.scene, this.camera)
      renderer.setRenderTarget(null)
    }
  }

}
