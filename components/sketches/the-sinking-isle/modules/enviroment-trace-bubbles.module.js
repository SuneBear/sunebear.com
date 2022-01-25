import * as THREE from 'three'

import Module from '../engine/module'
import { Random, math, ObjectPool, getEasePlayhead } from '../engine/utils'
import { detachObject } from '../utils/three-util'

export default class EnviromentTraceBubbles extends Module {
  constructor(sketch) {
    super(sketch)

    const random = Random(true, 'TraceBubbles')

    const group = new THREE.Group()
    group.name = 'envTraceBubbles'
    this.scene.add(group)

    const sphere0 = new THREE.SphereBufferGeometry(1, 2, 8)
    const sphere1 = new THREE.SphereBufferGeometry(1, 4, 8)
    sphere1.scale(1, 0.75, 1)

    const baseColor = new THREE.Color('#3ea7e0')
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.4
    })
    const waterMesh = new THREE.Mesh(sphere0, material)
    const pool = new ObjectPool({
      maxCapacity: 150,
      initialCapacity: 50,
      create() {
        const m = waterMesh.clone()
        m.geometry = random.boolean() ? sphere0 : sphere1
        m.material = material.clone()
        m.userData.velocity = new THREE.Vector3()
        m.material.color.copy(baseColor)
        m.material.color.offsetHSL(
          random.range(-1, 1) * 0.0,
          random.range(-1, 1) * 0.0,
          random.range(-1, 1) * 0.1
        )
        m.material.color.multiplyScalar(random.range(0.2, 1))
        const bloom = 1
        m.material.color.r += bloom
        m.material.color.g += bloom
        m.material.color.b += bloom
        m.userData.time = 0
        m.userData.scale = 1
        m.userData.duration = 1
        m.userData.delay = 1
        m.userData.speed = 1
        m.visible = false
        return m
      },
      renew(m) {
        m.visible = true
      },
      release(m) {}
    })

    const newSpawnDelay = () => random.range(0.01)
    let spawnDelay = newSpawnDelay()
    let spawnTime = random.range(0, spawnDelay)

    const tmpArr2D = [0, 0]
    const tmpArr4D = [0, 0, 0, 0]

    const activeMeshes = group.children
    const newCooldownDelay = () => random.range(0.01, 0.01)
    let hitCooldownDelay = newCooldownDelay()
    let hitCooldownTime = 0
    const activeEnv = this.enviroment
    const hasIce = activeEnv.lakeGeo?.hasIce
    const audioItems = hasIce ? [ 'iceTrace1', 'iceTrace2', 'iceTrace3' ] : [ 'waterTrace1', 'waterTrace2' ]
    let lastAudioPlayer = null

    let lastPos = null
    const distThreshold = 0.4
    const distThresholdSq = distThreshold * distThreshold

    this.processWaterBubbles = dt => {
      const userCharData = this.player
      const underPlayer = this.player.underState
      const userVelocity = userCharData.velocity
      const userPos = userCharData.position
      const hasMovedFarEnough =
        !lastPos || userPos.distanceToSquared(lastPos) >= distThresholdSq

      if (lastAudioPlayer) {
        hitCooldownTime += dt
        if (hitCooldownTime >= hitCooldownDelay) {
          hitCooldownTime %= hitCooldownDelay
          hitCooldownDelay = newCooldownDelay()
          lastAudioPlayer = null
        }
      }

      const showWater = underPlayer.isInLake

      if (showWater) {
        spawnTime += dt
        if (spawnTime >= spawnDelay) {
          spawnTime %= spawnDelay
          spawnDelay = newSpawnDelay()
          if (hasMovedFarEnough) {
            const n = random.rangeFloor(1, 5)
            for (let i = 0; i < n; i++) {
              if (!spawnOne(userPos, userVelocity)) break
            }
          }
        }

        if (
          hasMovedFarEnough &&
          showWater &&
          !lastAudioPlayer
        ) {
          if (!lastPos) {
            lastPos = new THREE.Vector3()
          }
          lastPos.copy(userPos)
          lastAudioPlayer = this.audio.play(random.pick(audioItems))
        }
      }

      activeMeshes.forEach(m => {
        m.userData.time += dt
        const curTime = m.userData.time - m.userData.delay
        if (!m.visible && curTime >= 0) {
          m.visible = true
        }
        const curElapsed = Math.max(0, curTime)
        const curAlpha = math.clamp01(curElapsed / m.userData.duration)
        const scl = Math.max(1e-5, Math.sin(curAlpha * Math.PI))
        m.scale.setScalar(m.userData.scale * scl)
        m.position.addScaledVector(m.userData.velocity, -m.userData.speed)
        // m.position.y += dt * 10
        if (curElapsed >= m.userData.duration) {
          m.visible = false
          detachObject(m)
          pool.release(m)
        }
      })
    }

    function spawnOne(userPos, userVelocity, big) {
      const m = pool.next()
      if (!m) return false
      // const offset = new THREE.Vector3(0, 0, 0)
      m.userData.velocity.copy(userVelocity)
      m.quaternion.fromArray(random.quaternion(tmpArr4D))
      m.position.copy(userPos)
      // m.position.add(offset)
      random.insideCircle(random.range(0.05, 0.5), tmpArr2D)
      m.position.x += tmpArr2D[0]
      m.position.z += tmpArr2D[1]
      m.position.y = 0.3
      m.visible = false
      m.userData.scale = (big ? 0.6 : 0.4) * random.gaussian(0.1, 0.1 / 3)
      m.userData.time = 0
      m.userData.delay = random.range(0, 0.1)
      m.userData.speed = random.range(0.05, 0.1)
      m.userData.duration = random.range(0.5, 1)
      group.add(m)
      return m
    }
  }

  update(delta) {
    this.processWaterBubbles(delta)
  }
}
