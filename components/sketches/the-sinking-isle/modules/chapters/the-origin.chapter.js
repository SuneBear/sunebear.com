import * as THREE from 'three'
import { Chapter } from './base'

import { TrailTouchTexture } from '../../objects/touch-textures'
import { FBMBubblePlaneObject } from '../../objects/fbm-bubble-plane.object'

export class TheOriginChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'theOrigin'

    this.setupTouchTexture()
    this.setupScene()
    this.setupDebug()
  }

  setupTouchTexture() {
    this.touchTexture = new TrailTouchTexture()
  }

  setupScene() {
    this.camera = new THREE.Camera()
    this.camera.position.z = 1
    this.scene.background = new THREE.Color(0x0c1b3b)

    this.fbmBubblePlaneObject = new FBMBubblePlaneObject({
      samplerTexture: this.touchTexture.texture
    })

    this.scene.add(this.fbmBubblePlaneObject)
  }

  setupDebug() {
    // @REF: https://codepen.io/SuneBear/pen/dBBzzX
  }

  beforeEnter() {
    this.sketch.control.on(`mousemove.${this.name}`, () => {
      this.touchTexture.addTouch(this.sketch.control.cursor.ratio)
    })
    this.pageScrollProgressWacher = this.$vm.$watch('pageScrollProgress', value => {
      this.fbmBubblePlaneObject.uniforms.uProgress.value = value * 30
    })
  }

  beforeLeave() {
    this.sketch.control.off(`mousemove.${this.name}`)
    this.pageScrollProgressWacher()
  }

  resize(width, height) {
    // @FIXME: Update camera aspect or zoom
    this.fbmBubblePlaneObject.resize(width, height)
  }

  update(delta) {
    this.pureRender()
    this.updateMaterial(delta)
    this.touchTexture.update()
  }

  updateMaterial(delta) {
    this.fbmBubblePlaneObject.uniforms.uTime.value += delta
  }

}
