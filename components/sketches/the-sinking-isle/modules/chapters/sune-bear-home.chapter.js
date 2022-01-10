import * as THREE from 'three'
import gsap from 'gsap'
import { Chapter } from './base'
import { setupPostProcess } from './post-process'
import { BuildingGroupObject } from '../../objects/building.object'
import { OrbitControls } from '../../utils/hack-deps/three/orbit-controls'

const IS_IN_PROGRESS = true

export class SuneBearHomeChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'suneBearHome'

    this.setupRender()
    this.setupLight()
    this.setupModel()
    this.setupTransition()
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

  setupModel() {
    this.model = new BuildingGroupObject({
      model: this.sketch.asset.items.chapterSuneBearHomeModel,
      name: 'suneBearHome',
      onModelSetup: (obj) => {
        if (obj.name === 'floor') {
          obj.material.emissiveIntensity = 0.10
        }
      },
      materialOptions: {
        castShadow: false,
        emissiveIntensity: 0.05
      }
    })

    this.model.position.z = 0.1

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

  beforeEnter() {
    this.controls.enabled = true
    this.progressFadeIn.restart(true)
  }

  beforeLeave() {
    this.controls.enabled = false
    this.progressFadeOut.restart(true)
  }

  startOnboarding() {
    if (!this.sketch.$vm.cachedContext.hasVisitedSuneBearHome) {
      if (IS_IN_PROGRESS) {
        this.sketch.$vm.$story.add({
          user: 'bear',
          message: this.sketch.$vm.$t('story.bear.suneBearHome.inProgress')
        })
      } else {
        // @TODO
      }
      this.sketch.$vm.cachedContext.hasVisitedSuneBearHome = true
    }
  }

  resize() {
    super.resize()
    this.postProcess.resize()
  }

  update(delta) {
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
      this.postProcess.render()
    } else {
      renderer.setRenderTarget(this.renderTarget)
      renderer.clear()
      renderer.render(this.scene, this.camera)
      renderer.setRenderTarget(null)
    }
  }

}
