import * as THREE from 'three'
import Module from '../engine/module'
import { math } from '../engine/utils'

import { PlayerObject } from '../objects/player.object'
import { PlayerPhysicsSpring } from '../utils/player-physics-spring'

export default class Player extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupInstance()
    this.setupMoveTargetSystem()
    this.setupSpringPlayerMoveSystem()
  }

  setupInstance() {
    this.instance = new THREE.Group({
      name: 'player'
    })
    this.instance.module = this

    this.playerObject = new PlayerObject()

    this.instance.add(this.playerObject)
    this.scene.add(this.instance)
  }

  setupMoveTargetSystem() {
    this.mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0)
    this.mousePlaneTarget = new THREE.Vector3()
    this.raycaster = new THREE.Raycaster()
    this.tmpPos3D = new THREE.Vector3()
    this.maxWorldSize = this.config.worldSize * 0.98
    this.targetPos = new THREE.Vector3()

    this.speed = 0.0
    this.minSpeed = 0.0
    this.maxSpeed = 3
    // Final factor for all moveTarget, springPlayerMove
    this.speedFactor = 0.4

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

  setupSpringPlayerMoveSystem() {
    const maxRadialDist = 1000
    const snapThreshold = maxRadialDist * 2
    this.maxRadialDistSq = maxRadialDist * maxRadialDist
    this.snapThresholdSq = snapThreshold * snapThreshold
    this.smoothTarget = new THREE.Vector3()
    this.spring = PlayerPhysicsSpring()
    this.spring.speedFactor = this.speedFactor
    this.hasSmoothTarget = false
    this.distFromSmoothThresholdSq = 25 * 25

    this.velocity = new THREE.Vector3()

    this.instance.velocity = this.velocity
    this.instance.direction = this.spring.direction
  }

  update(delta) {
    this.updateMoveTargetSystem(delta)
  }

  updateMoveTargetSystem(delta) {
    if (!this.$vm.enableUserMove) {
      return
    }

    const userTargetPos = this.targetPos
    let speedMultiplier = 1

    this.raycaster.setFromCamera(this.control.getMouse(), this.camera)
    const hit = this.raycaster.ray.intersectPlane(
      this.mousePlane,
      this.mousePlaneTarget
    )

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
    if (this.moveDirectionAngle !== null && this.mouseDirectionAngle !== null) {
      this.moveDirectionAngle = math.dampAngle(
        this.moveDirectionAngle,
        this.mouseDirectionAngle,
        7,
        delta
      )
      this.moveDirection.set(
        Math.cos(this.moveDirectionAngle),
        0,
        Math.sin(this.moveDirectionAngle)
      )
    }

    // Compute speed & boost
    let forceApplied = false
    if (this.control.isPressed('tap')) {
      forceApplied = true
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
    this.boosts.map(boost => {
      // @TODO: Support boosts
      totalBoost += boost.value
    })
    let directionIncrease =
      delta * totalSpeed * this.speedFactor +
      totalBoost * this.boostFactor * delta
    userTargetPos.addScaledVector(this.moveDirection, directionIncrease)

    // Drift
    const drift = this.$vm.enablePlayerDrift
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
    if (drift) {
      this.tmpPos3D.set(Math.cos(this.driftAngle), 0, Math.sin(this.driftAngle))
      userTargetPos.addScaledVector(this.tmpPos3D, delta * this.driftSpeed)
    }

    // Set movement boundary
    userTargetPos.x = math.clamp(
      userTargetPos.x,
      -this.maxWorldSize / 2,
      this.maxWorldSize / 2
    )
    userTargetPos.z = math.clamp(
      userTargetPos.z,
      -this.maxWorldSize / 2,
      this.maxWorldSize / 2
    )

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

  updateSpringPlayerMoveSystem(delta) {
    const { spring, smoothTarget } = this
    const playerMesh = this.instance

    let isClearVelocity
    const distFromTargetSq = this.targetPos.distanceToSquared(
      this.instance.position
    )

    if (distFromTargetSq >= this.snapThresholdSq) {
      playerMesh.position.copy(this.targetPos)
      spring.target.copy(this.targetPos)
      spring.position.copy(this.targetPos)
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

    if (!this.control.isPressed('tap')) {
      spring.moveToTarget = false
    }

    spring.update(delta)

    playerMesh.velocity
      .copy(spring.velocity)
      .multiplyScalar(0.2 / spring.maxVelocity)

    playerMesh.rotation.y = -math.dampAngle(
      -playerMesh.rotation.y,
      Math.atan2(this.moveDirection.z, this.moveDirection.x),
      50,
      delta
    )
    playerMesh.position.copy(spring.position)
    playerMesh.position.x = math.clamp(
      playerMesh.position.x,
      -this.maxWorldSize / 2,
      this.maxWorldSize / 2
    )
    playerMesh.position.z = math.clamp(
      playerMesh.position.z,
      -this.maxWorldSize / 2,
      this.maxWorldSize / 2
    )
  }
}
