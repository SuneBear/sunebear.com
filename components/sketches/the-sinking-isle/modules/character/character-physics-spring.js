import * as THREE from 'three'
import { math } from '../../engine/utils'

export function CharacterPhysicsSpring() {
  var Cd = 0.47 // Dimensionless
  var rho = 1.22 // kg / m^3
  var radius = 20
  var A = (Math.PI * radius * radius) / 10000 // m^2
  var gravity = -9.81 * 0.1 // m / s^2
  var mass = 0.05
  var restitution = -0.7
  var maxVel = 15
  const stiffness = 0.15
  const restingDistance = 1
  const EPSILON = 0.000001
  const zeroVec3D = new THREE.Vector3()
  const tmpVec3D = new THREE.Vector3()
  // const moveDistThreshold = 11;
  // const moveDistThresholdSq = moveDistThreshold * moveDistThreshold;
  const rawVelocity = new THREE.Vector3()
  const velocity = new THREE.Vector3()
  const direction = new THREE.Vector3()
  const target = new THREE.Vector3()
  const position = new THREE.Vector3()
  let moveToTarget = false
  // let continueMovingToTarget = false;

  return {
    maxVelocity: maxVel,
    lerpToTarget: false,
    speedFactor: 1,
    get moveToTarget() {
      return moveToTarget
    },
    set moveToTarget(bool) {
      // let old = moveToTarget;
      moveToTarget = bool
      // if (old !== v) {
      //   continueMovingToTarget = v;
      // }
    },
    target,
    position,
    velocity: rawVelocity,
    direction,
    update(dt) {
      const distSq = target.distanceToSquared(position)
      const dist = Math.sqrt(distSq)

      if (moveToTarget) {
        // TODO: fix this drifting physics issue...
        if (dist >= restingDistance) {
          tmpVec3D.copy(target).sub(position)
          const RK = dist
          const strength = math.clamp01(Math.pow(RK / 2.5, 1 / 5))
          const elastic = 0.1
          rawVelocity.addScaledVector(tmpVec3D, strength * elastic)
          // rawVelocity.addScaledVector(tmpVec3D, -scalarP2 * restingRatio * 1);
        }
      } else {
        math.dampVector(
          rawVelocity,
          zeroVec3D,
          1.5,
          dt,
          rawVelocity
        )
      }

      // clamp rawVelocity
      rawVelocity.x = math.clamp(rawVelocity.x, -maxVel, maxVel)
      rawVelocity.y = math.clamp(rawVelocity.y, -maxVel, maxVel)
      rawVelocity.z = math.clamp(rawVelocity.z, -maxVel, maxVel)

      var vx = rawVelocity.x
      var vy = rawVelocity.y
      var vz = rawVelocity.z
      var Fx = (-0.5 * Cd * A * rho * vx * vx * vx) / Math.abs(vx)
      var Fy = (-0.5 * Cd * A * rho * vy * vy * vy) / Math.abs(vy)
      var Fz = (-0.5 * Cd * A * rho * vz * vz * vz) / Math.abs(vz)
      Fx = isNaN(Fx) ? 0 : Fx
      Fy = isNaN(Fy) ? 0 : Fy
      Fz = isNaN(Fz) ? 0 : Fz
      // Calculate acceleration ( F = ma )
      var ax = Fx / mass
      var ay = Fy / mass
      var az = Fz / mass
      // Integrate to get rawVelocity
      rawVelocity.x += ax * dt
      rawVelocity.y += ay * dt
      rawVelocity.z += az * dt

      if (this.lerpToTarget) {
        math.dampVector(position, target, 0.75, dt, position)
      } else {
        // Integrate to get position
        position.x += rawVelocity.x * dt * this.speedFactor
        position.y += rawVelocity.y * dt * this.speedFactor
        position.z += rawVelocity.z * dt * this.speedFactor
      }

      direction.copy(rawVelocity).normalize()
    }
  }
}
