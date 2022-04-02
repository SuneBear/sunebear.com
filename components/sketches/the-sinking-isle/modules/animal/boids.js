import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { math } from '../../engine/utils'
import { ShadowSprite } from '../../objects/sprite.object'

// @REF: https://github.com/dtcan/boids
export const boidsParams = {
  ability: {
    maneuver: {
      min: 0.8,
      max: 1.0
    },
    speed: {
      min: 0.5,
      max: 3.0
    },
    sightRange: {
      min: 5.0,
      max: 10.0
    },
    // Separation
    avoidRange: {
      min: 1.0,
      max: 2.0
    },
    matchRange: {
      min: 4.0,
      max: 4.0
    }
  },
  priorities: {
    // Attact
    toCenter: 10,
    // Escape
    awayFromPlayer: 30,
    // Cohesion,
    cohesionVelocity: 0.2,
    // Separation
    awayFromOthers: 1,
    // Alignment
    matchVelocity: 2,
    noise: 0.14
  },
  scale: {
    spawn: {
      count: 8,
      range: 40
      // count: 2,
      // range: 10
    },
    playerDistance: 5.0,
    // Max distance to center
    roamDistance: 10.0,
    sightAmountLimit: 20
  }
}

class BoidsTree {
  constructor(lessThan, getDist) {
    this.x = null
    this.left = null
    this.right = null
    this.lessThan = lessThan
    this.getDist = getDist
  }

  insert(x, dim = 0) {
    if (this.x == null) {
      this.x = x
    } else if (this.lessThan(x, this.x, dim)) {
      if (this.left == null) {
        this.left = new BoidsTree(this.lessThan, this.getDist)
      }
      this.left.insert(x, (dim + 1) % 3)
    } else {
      if (this.right == null) {
        this.right = new BoidsTree(this.lessThan, this.getDist)
      }
      this.right.insert(x, (dim + 1) % 3)
    }
  }

  inRange(x, range, dim = 0) {
    if (this.x != null) {
      let less = this.lessThan(x, this.x, dim)
      let dist = this.getDist(this.x, x)
      if (dist <= range) {
        let elems = []
        if (this.left) {
          elems = this.left.inRange(x, range, (dim + 1) % 3)
        }
        if (this.right) {
          let rightElems = this.right.inRange(x, range, (dim + 1) % 3)
          if (elems.length > 0) {
            // Merge lists
            let newElems = []
            let i = 0
            let j = 0
            while (i < elems.length && j < rightElems.length) {
              if (elems[i][1] < rightElems[j][1]) {
                newElems.push(elems[i])
                i++
              } else {
                newElems.push(rightElems[j])
                j++
              }
            }
            while (i < elems.length) {
              newElems.push(elems[i])
              i++
            }
            while (j < rightElems.length) {
              newElems.push(rightElems[j])
              j++
            }
            elems = newElems
          } else {
            elems = rightElems
          }
        }

        // Insert this node
        let a = 0
        let b = elems.length
        while (a < b) {
          let m = Math.floor((a + b) / 2)
          if (elems[m][1] == dist) {
            break
          } else if (elems[m][1] < dist) {
            a = m + 1
          } else {
            b = m
          }
        }
        elems.splice(a, 0, [this.x, dist])
        return elems
      } else if (this.left && less) {
        return this.left.inRange(x, range, (dim + 1) % 3)
      } else if (this.right && !less) {
        return this.right.inRange(x, range, (dim + 1) % 3)
      }
    }
    return []
  }

  forEach(func) {
    if (this.x) {
      func(this.x)
    }
    if (this.left) {
      this.left.forEach(func)
    }
    if (this.right) {
      this.right.forEach(func)
    }
  }
}

const geom = new THREE.ConeBufferGeometry(0.1, 0.2, 24)
const mat = [
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, roughness: 0.5, transmission: 0.5 })
]

// @TODO: Adjust boid params, object rotation
// @TODO: Optimize boundary limit
// @TODO: Add ripple animation, swimming animation
export class BoidsManager {
  constructor({ container, player, boidModel, onEscape, params = boidsParams, random, depthBound }) {
    const boids = []
    const mixers = []

    function randomDirection() {
      return new THREE.Vector3(
        random.value() - 0.5,
        random.range(depthBound[0] / params.scale.spawn.range, depthBound[1] / params.scale.spawn.range),
        // 0,
        random.value() - 0.5
      ).normalize()
    }

    function getValueByPercent(range, percent) {
      return percent * (range.max - range.min) + range.min
    }

    this.resetBoids = () => {
      while (boids.length > 0) {
        let boid = boids.pop()
        container.remove(boid.body)
      }
      for (let i = 0; i < params.scale.spawn.count; i++) {
        const body = SkeletonUtils.clone(boidModel.scene)
        const bodyRoot = body.getObjectByName('Root')
        const maneuverPercent = random.value()

        // Set Shadow
        // @TODO: Polish ShadowSprite or replace with castShadow: true
        const shadow = new ShadowSprite()
        shadow.scale.set(1, 1, 1).multiplyScalar(0.5)
        shadow.position.x = 0.05
        shadow.position.z = -0.3
        // bodyRoot.add(shadow)

        // Animation
        const mixer = new THREE.AnimationMixer(body)
        const swimClipAction = mixer.clipAction(boidModel.animations[0])
        swimClipAction.timeScale = 2
        swimClipAction.reset().play()
        mixers.push(mixer)

        let boid = {
          shadow,
          body: body || new THREE.Mesh(
            geom,
            mat[0]
          ),
          velocity: new THREE.Vector3(),
          maneuverPercent,
          isEscaping: false,
          speedPercent: random.value(),
          sightRangePercent: random.value(),
          avoidRangePercent: random.value(),
          matchRangePercent: random.value()
        }
        boid.body.scale.multiplyScalar(random.range(0.4, 1.7))
        boid.body.scale.z *= 0.5
        // boid.body.scale.x *= 0.5
        // boid.body.scale.y *= 0.2
        boid.body.position
          .copy(randomDirection())
          .multiplyScalar(random.value() * params.scale.spawn.range)
        boid.body.position.y = random.range(depthBound[0], depthBound[1])
        // boid.body.position.y = 0.5
        boid.velocity
          .copy(randomDirection())
          .multiplyScalar(
            getValueByPercent(params.ability.speed, boid.speedPercent)
          )
        boids.push(boid)
        container.add(boid.body)
        container.dispatchEvent({ type: 'add', message: boid.body })
      }
    }

    this.getTargetVelocity = (boid, boidsTree) => {
      const epsilon = 1e-3

      let seenBoids = boidsTree.inRange(
        boid,
        getValueByPercent(params.ability.sightRange, boid.sightRangePercent)
      )
      // let toCohesion = player.position.clone()
      let toCohesion = new THREE.Vector3()
      let awayFromOthers = new THREE.Vector3()
      let awayFromPlayer = new THREE.Vector3()
      let matchVelocity = new THREE.Vector3()
      let matchTotal = 0

      // const playerTarget = player.targetPos.clone()
      const playerTarget = player.position.clone()
      const bodyPosition = boid.body.position.clone()
      playerTarget.y = bodyPosition.y = 0
      const distToPlayer = bodyPosition.distanceTo(playerTarget)

      // Escape from player
      if (
        distToPlayer <= boidsParams.scale.playerDistance &&
        player.module.spring.moveToTarget
      ) {
        let pushVec = new THREE.Vector3()
          .subVectors(bodyPosition, playerTarget)
          .multiplyScalar(boidsParams.priorities.awayFromPlayer * getValueByPercent(params.ability.speed, boid.speedPercent) / distToPlayer)
        awayFromPlayer.add(pushVec)
        if (!boid.isEscaping) {
          onEscape && onEscape()
          boid.isEscaping = true
        }
        return awayFromPlayer
      } else {
        boid.isEscaping = false
      }

      for (
        let i = 0;
        i < Math.min(seenBoids.length, params.scale.sightAmountLimit);
        i++
      ) {
        let other = seenBoids[i][0]
        let d = seenBoids[i][1]
        toCohesion.add(other.body.position)
        if (
          d <
          getValueByPercent(params.ability.avoidRange, boid.avoidRangePercent)
        ) {
          let pushVec = new THREE.Vector3()
            .add(boid.body.position)
            .sub(other.body.position)
            .normalize()
            .multiplyScalar(Math.exp(-d))
          awayFromOthers.add(pushVec)
        }
        if (
          d <
          getValueByPercent(params.ability.matchRange, boid.matchRangePercent)
        ) {
          matchVelocity.add(other.velocity)
          matchTotal++
        }
      }
      toCohesion
        .divideScalar(seenBoids.length + epsilon)
        .sub(boid.body.position)
        .normalize()
      awayFromOthers.normalize()
      matchVelocity.divideScalar(matchTotal + epsilon).normalize()

      let toCenter = playerTarget
      if (distToPlayer > params.scale.roamDistance) {
        toCenter
          .sub(boid.body.position)
          .normalize()
          .multiplyScalar(
            Math.min((distToPlayer - params.scale.roamDistance) / 10.0, 1.0)
          )
      }

      return new THREE.Vector3()
        .addScaledVector(toCenter, boidsParams.priorities.toCenter)
        .addScaledVector(toCohesion, boidsParams.priorities.cohesionVelocity)
        .addScaledVector(awayFromOthers, boidsParams.priorities.awayFromOthers)
        .addScaledVector(awayFromPlayer, boidsParams.priorities.awayFromPlayer)
        .addScaledVector(matchVelocity, boidsParams.priorities.matchVelocity)
        .addScaledVector(randomDirection(), boidsParams.priorities.noise)
        .normalize()
        .multiplyScalar(
          getValueByPercent(params.ability.speed, boid.speedPercent)
        )
    }

    this.processBoids = delta => {
      mixers.map(mixer => mixer.update(delta))

      delta = Math.min(delta, 0.1)

      // Build tree
      let boidsTree = new BoidsTree(
        (boid1, boid2, dim) => {
          let p1 = boid1.body.position
          let p2 = boid2.body.position
          let vals1 = [p1.x, p1.y, p1.z]
          let vals2 = [p2.x, p2.y, p2.z]
          return vals1[dim] < vals2[dim]
        },
        (boid1, boid2) => boid1.body.position.distanceTo(boid2.body.position)
      )
      boids.forEach(boid => boidsTree.insert(boid))

      // Update boids
      boidsTree.forEach(boid => {
        let target = this.getTargetVelocity(boid, boidsTree)
        // target.y = 0
        boid.velocity.lerp(
          target,
          delta *
            getValueByPercent(params.ability.maneuver, boid.maneuverPercent)
        )
        boid.body.rotation.setFromQuaternion(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1.0, 0).cross(boid.velocity).normalize(),
            new THREE.Vector3(0.0, 1.0, 0.0).angleTo(boid.velocity)
          )
        )

        // Flip
        const flipLimit = Math.PI / 6
        boid.body.rotation.x = math.clamp(boid.body.rotation.x, -flipLimit, flipLimit)
        boid.body.rotation.z = math.clamp(boid.body.rotation.z, -flipLimit, flipLimit)
        // Direction
        boid.body.rotation.y = Math.PI / 2 - Math.atan2(boid.velocity.z, boid.velocity.x)

        boid.shadow.rotation.y = -boid.body.rotation.y
        boid.shadow.rotation.x = -boid.body.rotation.x
        boid.shadow.rotation.z = boid.body.rotation.z

        // Move
        boid.body.position.addScaledVector(boid.velocity, delta)
        // Depth Bounds
        if (boid.body.position.y < depthBound[0] && boid.velocity.y < 0) {
          boid.body.position.y = depthBound[0]
          boid.velocity.y *= -1
        }
        if (boid.body.position.y > depthBound[1] && boid.velocity.y > 0) {
          boid.body.position.y = depthBound[1]
          boid.velocity.y *= -1
        }
      })
    }

    this.resetBoids()
  }

  update(delta) {
    this.processBoids(delta)
  }
}
