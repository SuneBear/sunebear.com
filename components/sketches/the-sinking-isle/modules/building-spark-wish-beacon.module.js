import * as THREE from 'three'
import gsap from 'gsap'
import Module from '../engine/module'
import { Random } from '../engine/utils'
import { getFormattedDate } from '~/utils/time'

import { FireworksManager } from './particle/fireworks'

// @TODO: Support custom firework pattern via custom text
export default class BuildingSparkWishBeacon extends Module {

  constructor(sketch) {
    super(sketch)
    const name = 'SparkWishBeacon'
    const random = Random(true, name)
    const group = new THREE.Group()
    group.name = name
    this.group = group
    this.scene.add(group)
    this.localDebug = false || this.$vm.$route.query.island === name

    this.setupFireworks()
    this.setupListener()
    this.setupDebug()
  }

  setupFireworks() {
    this.building = this.scene.getObjectByName('sparkWishBeacon')
    if (this.building) {
      this.group.position.copy(this.building.position)
    }

    this.fireworksManager = new FireworksManager({
      audioEngine: this.audio,
      sizes: this.sizes,
      container: this.group,
      pixelRatio: this.config.pixelRatio
    })
  }

  setupListener() {
    let lastToneMappingExposure
    let lastBloomThreshold
    let lastBloomStrength

    const unrealBloomPass = this.renderer.module.postProcess.unrealBloomPass

    const enterViewSparkMode = async () => {
      this.isViewing = true
      this.$vm.cameraTarget = this.building.position.clone()
      lastToneMappingExposure = this.renderer.toneMappingExposure
      lastBloomThreshold = unrealBloomPass.threshold
      lastBloomStrength = unrealBloomPass.strength
      gsap.to(this.renderer, {
        toneMappingExposure: 1,
        overwrite: true
      })
      gsap.to(unrealBloomPass, {
        threshold: 0.04,
        strength: 2,
        overwrite: true
      })
      await gsap.to(this.$vm.cameraTarget, {
        y: 25,
        z: this.player.position.z + 15,
        x: this.player.position.x - 1.1,
        overwrite: true
      })
      this.startSparkWish()
      this.startStoryOnboard()
    }

    const exitViewSparkMode = async () => {
      this.isViewing = false
      gsap.to(this.renderer, {
        toneMappingExposure: lastToneMappingExposure,
        overwrite: true
      })
      gsap.to(unrealBloomPass, {
        threshold: lastBloomThreshold,
        strength: lastBloomStrength,
        overwrite: true
      })
      await gsap.to(this.$vm.cameraTarget, {
        y: this.player.position.y,
        z: this.player.position.z,
        x: this.player.position.x,
        overwrite: true
      })
      // Reset targetPos to avoid flicking
      this.player.targetPos.copy(this.player.position)
      this.$vm.cameraTarget = 'player'
      this.stopStarkWish()
    }

    // @TODO: Abstract tweenSwitchTarget method
    // @TODO: Support zoom camera, update player position
    // @TODO: Support freelook
    this.$vm.$watch('currentActionMode', async (value) => {
      if (value === 'viewSpark'){
        enterViewSparkMode()
      } else if (this.isViewing) {
        exitViewSparkMode()
      }
    })

    this.$vm.$on('sparkWishConfirm', (text) => {
      const manager = this.fireworksManager
      const position = manager.launcher.getLaunchPosition(true)
      this.fireworksManager.emit(position, { text })
    })
  }

  setupDebug() {
    if (!this.localDebug) {
      return
    }

    this.player.module.setPlayerPositon(-5, -49)
    this.submitFrame.addFrameTask(() => {
      this.$vm.currentActionMode = 'viewSpark'
    })
  }

  startStoryOnboard() {
    if (this.$vm.cachedContext.sparkWishBeaconVisitTime) {
      return
    }

    const time = Date.now()
    this.$vm.cachedContext.sparkWishBeaconVisitTime = time

    this.$vm.$story.add({
      user: 'system',
      silent: true,
      message: this.$vm.$t('story.system.sparkWishBeaconVisitTime', { date: getFormattedDate(time) })
    })

    this.$vm.$story.add({
      user: 'bear',
      message: this.$vm.$t('story.bear.sparkWishBeacon.intro')
    })
  }

  startSparkWish() {
    this.fireworksManager.start()
    if (this.localDebug) {
      this.$vm.$emit('sparkWishConfirm', '🍊 大橘大利')
    }
  }

  stopStarkWish() {
    this.fireworksManager.stop()
  }

  update(delta, time) {
    this.fireworksManager.update(delta, time)
  }

}
