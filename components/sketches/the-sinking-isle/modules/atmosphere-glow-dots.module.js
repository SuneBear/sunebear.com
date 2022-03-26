import * as THREE from 'three'

import Module from './base'
import { Random, math, ObjectPool, getEasePlayhead } from '../engine/utils'
import { detachObject } from '../utils/three-util'
import { RENDER_LAYERS } from '../utils/constants'

export default class AtmosphereGlowDots extends Module {
  constructor(sketch) {
    super(sketch)

    const random = Random(true, 'GlowDots')

    const group = new THREE.Group()
    group.name = 'atmosphereGlowDots'
    this.scene.add(group)
    const scope = this

    const meshes = group.children

    const bases = [
      new THREE.TetrahedronBufferGeometry(1, 0),
      new THREE.TetrahedronBufferGeometry(1, 1)
    ]
    const tmpVec = new THREE.Vector3()

    const geometries = new Array(3).fill(0).map((_, i) => {
      const geometry = new THREE.BufferGeometry()
      const baseGeometry = bases[i % bases.length]
      const positions = baseGeometry.attributes.position
      const newPositions = new THREE.Float32BufferAttribute(
        new Float32Array(positions.array.length),
        3
      )
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)
        tmpVec.set(x, y, z)
        const n = tmpVec.clone().normalize()
        const v = tmpVec.clone().addScaledVector(n, random.gaussian(0, 1 / 8))
        newPositions.setX(i, v.x)
        newPositions.setY(i, v.y)
        newPositions.setZ(i, v.z)
      }
      geometry.setAttribute('position', newPositions)
      geometry.setIndex(baseGeometry.getIndex())
      return geometry
    })

    const pool = new ObjectPool({
      maxCapacity: 35,
      initialCapacity: 35,
      create: () => {
        const material = new THREE.ShaderMaterial({
          extensions: {
            derivatives: true
          },
          fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D map;
            uniform vec3 color;
            uniform float opacity;
            float aastep(float threshold, float value) {
              float change = fwidth(value) * 0.5;
              float lo = threshold - change;
              float hi = threshold + change;
              return clamp((value - lo) / (hi - lo), 0.0, 1.0);
            }

            void main () {
              // float a = aastep(0.5, texture2D(map, vUv).a);

              gl_FragColor.rgb = color;
              if (!gl_FrontFacing) gl_FragColor.rgb *= 0.75;
              gl_FragColor.a = 1.0;
              // gl_FragColor.rgb *= opacity * a;
              // gl_FragColor.a = opacity * a;
              // if (gl_FragColor.a < 0.1) discard;
            }
          `,
          vertexShader: `
            varying vec2 vUv;
            void main () {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
            }
          `,
          uniforms: {
            opacity: { value: 1 },
            color: { value: new THREE.Color() }
          },
          // depthTest: false,
          // depthWrite: false,
          // side: THREE.DoubleSide,
          // transparent: true,
          blending: THREE.AdditiveBlending
        })
        const mesh = new THREE.Mesh(random.pick(geometries), material)
        mesh.layers.enable(RENDER_LAYERS.BLOOM)

        this.tween.add({
          target: mesh.userData,
          isPlaying: false,
          duration: 2,
          easing: 'easeOutSine',
          killWhenFinished: false,
          tween: 1
        })

        mesh.userData.tween = 0
        mesh.userData.size = 0.1
        mesh.userData.speed = 0
        mesh.userData.alpha = 1
        mesh.userData.velocity = new THREE.Vector3()
        mesh.userData.rotationAxis = new THREE.Vector3()
        mesh.userData.rotationSpeed = 1
        mesh.userData.rotationAngleOffset = 0
        mesh.frustumCulled = false
        mesh.name = 'glowDot'
        mesh.matrixAutoUpdate = false
        return mesh
      }
    })

    const distThreshold = 1
    const tmpDir = new THREE.Vector3()
    const tmp2D = [0, 0]
    const tmp3D = [0, 0, 0]
    const tmpQuatArray = [0, 0, 0, 0]
    const char = this.player
    const targetPos = this.player.targetPos

    let elapsed = 0
    let minDelay = 0.1
    let maxDelay = 0.3
    let curDelay = minDelay

    const initialSpawns = 5
    for (let i = 0; i < initialSpawns; i++) {
      spawn(targetPos, char.direction)
    }
    const env = this.enviroment

    this.processGlowDots = (dt) => {
      if (env.name === 'tundra') return

      forward(dt)

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i]
        const tweener = mesh.userData.tweener
        const s = mesh.userData.tween * mesh.userData.size
        mesh.scale.setScalar(s)
        const a = mesh.userData.tween * mesh.userData.alpha
        const bloom = 0.75
        mesh.material.uniforms.color.value.setRGB(
          a + bloom,
          a + bloom,
          a + bloom
        )
        mesh.material.uniforms.opacity.value = a
        mesh.position.addScaledVector(
          mesh.userData.velocity,
          dt * mesh.userData.speed
        )
        mesh.rotateOnWorldAxis(
          mesh.userData.rotationAxis,
          mesh.userData.rotationSpeed * dt
        )
        mesh.visible = mesh.userData.tween > 1e-5

        if (mesh.visible) {
          mesh.updateMatrix()
        }

        // mesh.userData.rotationSpeed
        if (tweener.hasFinished && mesh.userData.appearing) {
          mesh.userData.appearing = false
          mesh.userData.killing = true
          scope.setAnimateTo(mesh, 0, mesh.userData.holdDelay)
        }
        if (
          tweener.hasFinished &&
          mesh.userData.killing &&
          !mesh.userData.appearing
        ) {
          mesh.userData.killing = false
          mesh.userData.appearing = false
          detachObject(mesh)
          pool.release(mesh)
        }
      }
    }

    function forward(dt = 0) {
      elapsed += dt
      if (elapsed >= curDelay) {
        elapsed %= curDelay
        curDelay = random.range(minDelay, maxDelay)
        spawn(targetPos, char.direction)
      }
    }

    function spawn(position, direction, explode) {
      const n = explode ? random.rangeFloor(1, 5) : 1
      for (let i = 0; i < n; i++) spawnOne(position, direction, explode)
    }

    function spawnOne(position, direction, explode) {
      const mesh = pool.next()
      if (mesh) {
        mesh.visible = false
        group.add(mesh)
        mesh.position.copy(position)
        let r = random.gaussian(1, 6)
        if (random.gaussian(0, 1) > 0) r += random.gaussian(0, 4)
        if (random.gaussian(0, 1) > 1) r += random.gaussian(0, 8)

        random.insideCircle(
          random.gaussian(4, 2) +
            random.range(5, 10) +
            random.gaussian(0, 2) +
            1 * r * random.gaussian(0, 2),
          tmp2D
        )
        mesh.position.x += tmp2D[0]
        mesh.position.z += tmp2D[1]
        mesh.quaternion.fromArray(random.quaternion(tmpQuatArray))
        mesh.userData.holdDelay = random.range(0.0, 1)
        mesh.position.y = random.range(0.5, 6)
        // if (!explode) mesh.position.y += random.range(2, 2)
        mesh.userData.appearing = true
        mesh.userData.killing = false
        mesh.userData.size = random.range(0.02, 0.07)
        // mesh.userData.size = 0.15 + 1 * Math.abs(random.gaussian(0, 0.3 / 4))

        // math.clamp(
        //   Math.abs(random.gaussian(0.1, 0.1)),
        //   0.025,
        //   0.09
        // )
        mesh.userData.speed = math.clamp(
          Math.abs(random.gaussian(0.5, 0.2)),
          0.25,
          1
        )
        mesh.userData.tween = 0
        mesh.userData.velocity.set(0, 1, 0)
        mesh.quaternion.fromArray(random.quaternion(tmpQuatArray))
        mesh.userData.rotationAxis.fromArray(random.insideSphere(1, tmp3D))
        mesh.userData.rotationSpeed = 4
        mesh.userData.rotationAngleOffset = random.range(-1, 1) * Math.PI * 2
        mesh.userData.alpha = random.range(0.5, 1)
        if (explode) {
          random.insideCircle(1, tmp2D)
          tmpDir.x = tmp2D[0]
          tmpDir.y = random.range(0, 0.0)
          tmpDir.z = tmp2D[1]
          tmpDir.addScaledVector(direction, random.range(0, 1))
          tmpDir.normalize()
        } else {
          tmpDir.copy(direction)
          tmpDir.y += random.range(0, 0.5)
          tmpDir.normalize()
        }

        mesh.userData.velocity.copy(tmpDir)
        scope.setAnimateTo(mesh, 1, explode ? 0 : random.range(0, 1))
      }
    }
  }

  setAnimateTo (mesh, to, delay) {
    this.tween.set({
      target: mesh.userData,
      isPlaying: true,
      tween: to,
      elapsed: 0,
      delay
    })
  }

  update(delta) {
    this.processGlowDots(delta)
  }
}
