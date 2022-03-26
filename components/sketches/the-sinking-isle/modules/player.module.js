import * as THREE from 'three'
import Module from './base'
import { math } from '../engine/utils'

import { CharacterPhysicsSpring } from './character/character-physics-spring'
import { CharacterObject } from '../objects/character.object'
import { convertToToonMaterial } from '../objects/mesh-toon.material'
import { WaterBuoyancyAnimation } from '../objects/animations'
import { RENDER_LAYERS } from '../utils/constants'

// @TODO: Refactor playerMove, springEngine, moveTarget
// - Support smooth set player position
// - Support switch target
// - Distinguish player (user) and character
export default class Player extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupInstance()
    this.setupCharacter()
    this.setupBoat()
    this.setupUnderStateSystem()
    this.setupMoveTargetSystem()
    this.setupSpringCharacterMoveSystem()
  }

  setupInstance() {
    this.instance = new THREE.Group()
    this.instance.name = 'player'
    this.instance.module = this

    this.instance.renderOrder = RENDER_LAYERS.PLAYER
    this.instance.position.set(0, 0, 0)
    this.instance.rotation.y = Math.PI * 1.25

    this.instanceWaterBuoyancyAnimation = new WaterBuoyancyAnimation({
      object: this.instance,
      intensity: 3
    })

    this.enviroment && (this.enviroment.directionLight.target = this.instance)

    this.scene.add(this.instance)
  }

  setupCharacter() {
    const model = this.asset.items.playerCharacterModel
    const scene = model.scene

    scene.name = 'character'

    scene.position.x = 0.1
    scene.position.y = 0.6
    scene.rotation.y = Math.PI / 2
    scene.scale.multiplyScalar(0.58)
    scene.scale.z = 0.9

    scene.traverse(obj => {
      if (obj.material) {
        obj.renderOrder = RENDER_LAYERS.PLAYER + 1
        convertToToonMaterial(obj, {
          emissive: 0x404040,
          emissiveIntensity: 0.1,
          transparent: true,
          outlineColor: 0x010101,
          outlineThickness: 0.002
        })
      }
    })

    const mixer = new THREE.AnimationMixer(scene)
    // const paddleClipAction = mixer.clipAction(model.animations[1])
    // paddleClipAction.reset().play()

    // this.characterObject = new CharacterObject()
    // this.characterObject.layers.enable(RENDER_LAYERS.BLOOM)
    // this.instance.add(this.characterObject)

    this.characterMixer = mixer
    this.characterObject = scene
    this.instance.add(scene)
  }

  setupBoat() {
    const model = this.asset.items.playerBoatModel
    const boat = model.scene

    boat.name = 'boat'

    boat.position.x = 0.3
    boat.rotation.y = -Math.PI / 2
    boat.scale.multiplyScalar(0.32)

    boat.traverse(obj => {
      if (obj.name.includes('paddle')) {
        convertToToonMaterial(obj, {
          displacementScale: 20,
          color: 0x870606,
          emissive: 0x870606,
          emissiveIntensity: 0,
          outlineThickness: 0.001
        })
        obj.scale.multiply(new THREE.Vector3(2, 2, 1))
      } else if (obj.material) {
        convertToToonMaterial(obj, {
          displacementScale: 0.4,
          bumpScale: 1,
          outlineThickness: 0.003,
          outlineAlpha: 0.01,
          transparent: true
        })
      }
    })

    const mixer = new THREE.AnimationMixer(boat)
    const paddleClipAction = mixer.clipAction(model.animations[1])
    paddleClipAction.loop = THREE.LoopOnce

    this.boatMixer = mixer
    this.boatPaddleClipAction = paddleClipAction
    this.boatObject = boat
    this.instance.add(boat)
  }

  setupUnderStateSystem() {
    this.instance.underState = {
      isInLake: true,
      lake: this.enviroment?.lakeGeo.lakeInfos[0]
    }
  }

  setupMoveTargetSystem() {
    this.mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0)
    this.mousePlaneTarget = new THREE.Vector3()
    this.raycaster = new THREE.Raycaster()
    this.tmpPos3D = new THREE.Vector3()
    this.maxWorldSize = this.config.worldSize * 0.98
    // This pos is camrea focus on
    this.targetPos = new THREE.Vector3(0, 0, 0)

    this.speed = 0.0
    this.minSpeed = 0.0
    this.maxSpeed = 3
    // @Config: Final factor for all moveTarget, springPlayerMove
    this.speedFactor = 1 // 0.4
    if (this.$vm.$ua.isFromSmartphone()) {
      this.speedFactor *= 1.2
    }

    // @TODO: Support boost
    this.boost = 0
    this.boostFactor = 0
    this.boosts = []
    this.minBoost = 0
    this.maxBoost = 3

    this.mouseDirection = new THREE.Vector3()
    this.moveDirection = new THREE.Vector3()
    this.mouseDirectionAngle = null
    this.moveDirectionAngle = null
    this.isFixedDriftSpeed = false
    this.driftSpeed = 0.5
    this.driftAngle = math.degToRad(this.random.pick([1, 3, 5, 7]) * 45)

    this.wasForceApplied = null

    this.instance.targetPos = this.targetPos
  }

  setupSpringCharacterMoveSystem() {
    const maxRadialDist = this.config.worldSize // 12
    const snapThreshold = maxRadialDist * 2
    this.maxRadialDistSq = maxRadialDist * maxRadialDist
    this.snapThresholdSq = snapThreshold * snapThreshold
    this.smoothTarget = new THREE.Vector3()
    this.spring = CharacterPhysicsSpring()
    this.spring.speedFactor = this.speedFactor
    this.hasSmoothTarget = false
    this.distFromSmoothThresholdSq = 25 * 25

    this.velocity = new THREE.Vector3()

    this.instance.velocity = this.velocity
    this.instance.direction = this.spring.direction
    // Notice: Proxy player position to spring position
    // @TODO: Support set player position in update cycle
    this.spring.position.copy(this.instance.position)
  }

  setPlayerPositon(x, z, offset = 0) {
    const { spring, targetPos } = this
    spring.position.x = x + offset
    spring.position.z = z + offset
    targetPos.copy(spring.position)
  }

  update(delta, elapsed) {
    this.updateMoveTargetSystem(delta)
    this.instanceWaterBuoyancyAnimation.update(delta)
    this.boatMixer.update(delta)
  }

  updateMoveTargetSystem(delta) {
    const userTargetPos = this.targetPos
    let speedMultiplier = 1

    this.raycaster.setFromCamera(this.control.getMouse().multiplyScalar(0.5), this.camera)
    const hit = this.raycaster.ray.intersectPlane(
      this.mousePlane,
      this.mousePlaneTarget
    )

    this.$vm.cursor.x = this.control.cursor.x
    this.$vm.cursor.y = this.control.cursor.y
    this.$vm.isPressed = this.control.isPressed('tap')

    // @TODO: Support movement when mousemove
    // Compute speedMultiplier & moveDirection
    if (hit) {
      this.tmpPos3D.set(userTargetPos.x, 0, userTargetPos.z)
      this.mouseDirection.copy(this.mousePlaneTarget).sub(this.tmpPos3D)
      const len = this.mouseDirection.length()
      if (len !== 0) this.mouseDirection.divideScalar(len)
      const smooth = math.clamp01(Math.pow(len / 4, 1 / 25))
      speedMultiplier *= smooth
      this.mouseDirectionAngle = Math.atan2(
        this.mouseDirection.z,
        this.mouseDirection.x
      )
      if (this.moveDirectionAngle === null)
        this.moveDirectionAngle = this.mouseDirectionAngle
    }
    if (
      this.control.isPressed('tap') &&
      this.moveDirectionAngle !== null &&
      this.mouseDirectionAngle !== null
    ) {
      this.moveDirectionAngle = math.dampAngle(
        this.moveDirectionAngle,
        this.mouseDirectionAngle,
        7,
        delta
      )
      if (this.$vm.enableUserMoveInput) {
        this.moveDirection.set(
          Math.cos(this.moveDirectionAngle),
          0,
          Math.sin(this.moveDirectionAngle)
        )
      }
    }

    // Compute speed & boost
    let forceApplied = false
    if (this.control.isPressed('tap')) {
      forceApplied = true
      if (!this.boatPaddleClipAction.isRunning()) {
        this.$vm.cachedContext.tourDistance += 1
        this.boatPaddleClipAction.reset().play()
      }
      this.speed = math.damp(this.speed, this.maxSpeed, 5, delta)
      this.boost = math.damp(this.boost, this.maxBoost, 2, delta)
    } else {
      this.speed = math.damp(this.speed, this.minSpeed, 2, delta)
      this.boost = math.damp(this.boost, this.minBoost, 5, delta)
    }

    if (forceApplied !== this.wasForceApplied) {
      this.wasForceApplied = forceApplied
    }
    this.speed *= speedMultiplier
    this.boost *= speedMultiplier

    let totalSpeed = this.speed + this.boost
    let totalBoost = 0
    // @TODO: Support boosts
    // this.boosts.map(boost => {
    //   totalBoost += boost.value
    // })
    let directionIncrease =
      delta * totalSpeed * this.speedFactor +
      totalBoost * this.boostFactor * delta

    if (this.$vm.enableUserMoveInput) {
      userTargetPos.addScaledVector(this.moveDirection, directionIncrease)
    }

    // Drift
    this.updatePlayerDrift()

    // Set movement boundary
    // @TEMP: Removed boundary limit
    // userTargetPos.x = math.clamp(
    //   userTargetPos.x,
    //   -this.maxWorldSize / 2,
    //   this.maxWorldSize / 2
    // )
    // userTargetPos.z = math.clamp(
    //   userTargetPos.z,
    //   -this.maxWorldSize / 2,
    //   this.maxWorldSize / 2
    // )

    // Update instance data
    this.instance.totalBoost = totalBoost
    this.instance.forceApplied = forceApplied
    this.instance.inputHitPlane = hit
    this.instance.totalSpeedAlpha = math.inverseLerp(
      this.minSpeed + this.minBoost,
      this.maxSpeed + this.maxBoost,
      totalSpeed
    )
    if (hit) {
      this.instance.inputPositionOnPlane = this.mousePlaneTarget
    }

    // Apply target to player instance
    this.updateSpringPlayerMoveSystem(delta)
  }

  updatePlayerDrift() {
    const drift = this.$vm.enablePlayerDrift

    if (!drift) {
      return
    }

    const userTargetPos = this.targetPos
    let newDriftSpeed = this.driftSpeed

    if (this.control.isPressed('tap')) {
      const mouse = this.control.getMouse()
      const u = mouse.x
      const v = mouse.y
      const dist = math.clamp01(Math.sqrt(u * u + v * v))
      newDriftSpeed = math.lerp(0.1, 0.75, Math.pow(dist, 0.5))
    }
    if (this.isFixedDriftSpeed) {
      newDriftSpeed = 0.05
    }

    const newDriftAngle =
      this.moveDirectionAngle != null
        ? this.moveDirectionAngle
        : this.driftAngle
    this.driftAngle = math.dampAngle(this.driftAngle, newDriftAngle, 3, delta)
    this.driftSpeed = math.dampAngle(this.driftSpeed, newDriftSpeed, 5, delta)
    this.tmpPos3D.set(Math.cos(this.driftAngle), 0, Math.sin(this.driftAngle))
    userTargetPos.addScaledVector(this.tmpPos3D, delta * this.driftSpeed)
  }

  updateSpringPlayerMoveSystem(delta) {
    const { spring, smoothTarget } = this
    const playerMesh = this.instance

    let isClearVelocity
    const distFromTargetSq = this.targetPos.distanceToSquared(
      this.instance.position
    )

    // Auto reset target position to player
    if (false && distFromTargetSq >= this.snapThresholdSq) {
      this.targetPos.copy(playerMesh.position)
      // Reset player to target
      // playerMesh.position.copy(this.targetPos)
      // spring.target.copy(this.targetPos)
      // spring.position.copy(this.targetPos)
      isClearVelocity = true
    }

    if (isClearVelocity) {
      playerMesh.velocity.set(0, 0)
      spring.velocity.set(0, 0, 0)
      spring.direction.set(1, 0, 0)
    }

    if (playerMesh.inputHitPlane) {
      spring.moveToTarget = true
      if (this.hasSmoothTarget) {
        // if we need to reset smoother
        const distFromSmoothSq = smoothTarget.distanceToSquared(
          playerMesh.inputPositionOnPlane
        )
        if (distFromSmoothSq >= this.distFromSmoothThresholdSq) {
          this.hasSmoothTarget = false
        }
      }

      if (!this.hasSmoothTarget) {
        this.hasSmoothTarget = true
        smoothTarget.copy(playerMesh.inputPositionOnPlane)
      } else {
        math.dampVector(
          smoothTarget,
          playerMesh.inputPositionOnPlane,
          10,
          delta,
          smoothTarget
        )
      }
      // Clamp Target
      // smoothTarget.x = math.clamp(
      //   smoothTarget.x,
      //   -this.maxWorldSize / 2,
      //   this.maxWorldSize / 2
      // )
      // smoothTarget.z = math.clamp(
      //   smoothTarget.z,
      //   -this.maxWorldSize / 2,
      //   this.maxWorldSize / 2
      // )
      spring.target.copy(smoothTarget).sub(this.targetPos)
      const distSq = spring.target.lengthSq()
      if (distSq >= this.maxRadialDistSq) {
        const dist = Math.sqrt(distSq)
        if (dist !== 0) {
          // normalize vector
          spring.target.divideScalar(dist)
        }
        spring.target.multiplyScalar(this.maxRadialDist).add(this.targetPos)
      } else {
        spring.target.copy(smoothTarget)
      }
    } else {
      spring.moveToTarget = false
    }

    if (!this.control.isPressed('tap') || !this.$vm.enableUserMoveInput) {
      spring.moveToTarget = false
    }

    playerMesh.velocity
      .copy(spring.velocity)
      .multiplyScalar(0.2 / spring.maxVelocity)

    if (
      this.hasSmoothTarget &&
      spring.velocity.length() > this.speedFactor / 5
    ) {
      playerMesh.rotation.y = -math.dampAngle(
        -playerMesh.rotation.y,
        Math.atan2(this.moveDirection.z, this.moveDirection.x),
        50,
        delta
      )
    }

    spring.update(delta)
    this.updateLakeBoundaryEvent()
    playerMesh.position.copy(spring.position || this.targetPos)
  }

  // @TODO: Optimize lake boundary limit
  // @TEMP: Removed boundary limit
  updateLakeBoundaryEvent() {
    if (this.$vm.cachedContext.hasShownBoundaryStory) {
      return
    }

    const { spring } = this

    const positionOffset = 2.0
    const springScale = 0.95
    if (
      !this.enviroment.isInsideLake([
        spring.position.x * springScale + positionOffset,
        spring.position.z * springScale + positionOffset
      ])
    ) {
      // smoothTarget.x *= 0.5
      // smoothTarget.z *= 0.5
      // spring.position.copy(playerMesh.position)
      // spring.velocity.set(0, 0, 0)
      // spring.moveToTarget = false
      // spring.update(delta)
      // return

      // Show boundary story
      if (!this.$vm.cachedContext.hasShownBoundaryStory) {
        this.$vm.$story.add({
          message: this.$vm.$t('story.bear.firstReachTheLakeEdge.main'),
          actions: [
            {
              type: 'reply',
              text: this.$vm.$t('story.bear.firstReachTheLakeEdge.replyFly'),
              responsive: this.$vm.$t(
                'story.bear.firstReachTheLakeEdge.replyFlyRes'
              )
            },
            {
              type: 'reply',
              text: this.$vm.$t(
                'story.bear.firstReachTheLakeEdge.replyNothing'
              ),
              responsive: this.$vm.$t(
                'story.bear.firstReachTheLakeEdge.replyNothingRes'
              )
            }
          ]
        })
        this.$vm.cachedContext.hasShownBoundaryStory = true
      }
    }
  }
}
