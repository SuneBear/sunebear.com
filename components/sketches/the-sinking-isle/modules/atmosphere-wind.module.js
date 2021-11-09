import * as THREE from 'three'

import Module from '../engine/module'
import { Random, math, getEasePlayhead } from '../engine/utils'
import { Line3D } from '../objects/line-3d.object'
import { getPathFromSVG } from '../utils/svg-path'
import { detachObject } from '../utils/three-util'

export default class AtmosphereWind extends Module {
  constructor(sketch) {
    super(sketch)

    const random = Random(true, 'Wind')
    const group = new THREE.Group()
    group.name = 'atmosphereWind'
    this.scene.add(group)

    const pathDatas = getPaths().map(svg => {
      const points = getPathFromSVG(svg).map(p => {
        return new THREE.Vector3(p[0], 0, p[1])
      })
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      return curve.getSpacedPoints(100).map(p => p.toArray())
    })

    const pathLines = pathDatas.map(data => {
      const mesh = new Line3D({
        thickness: 0.2,
        bloom: 0,
        dotted: false,
        taper: false
      })
      mesh.updatePath(data)
      mesh.userData = {
        time: 0,
        animateDuration: 0.25,
        duration: 4
      }
      return mesh
    })

    this.pathLines = pathLines

    let spawnTimer = 0
    const newSpawnDelay = () => random.range(1, 2)
    let spawnDelay = newSpawnDelay()

    const tmp2DArr = [0, 0]
    const target = this.player
    const windLines = group.children

    this.processWind = (dt) => {
      const env = this.enviroment.lakeGeo
      let canSpawn = env && env.lakes.length

      if (!canSpawn) {
        windLines.map(line => {
          detachObject(line)
        })
        return
      }

      spawnTimer += dt
      if (spawnTimer >= spawnDelay) {
        spawnTimer %= spawnDelay
        spawnDelay = newSpawnDelay()
        spawn(target.position)
      }

      windLines.map(line => {
        const wind = line.userData
        wind.time += dt

        let anim = getEasePlayhead(wind)

        line.material.uniforms.thickness.value =
          line.userData._lineThickness * anim
        line.material.uniforms.time.value += dt
        line.material.uniforms.draw.value = wind.time / wind.duration

        if (wind.time >= wind.duration) {
          detachObject(line)
          wind.time = 0
          line.material.uniforms.time.value = 0
        }
      })
    }

    function nextRandomAvailable() {
      const start = random.rangeFloor(0, pathLines.length)
      for (let i = 0; i < pathLines.length; i++) {
        const k = (i + start) % pathLines.length
        if (!pathLines[k].userData.time) return pathLines[k]
      }
      return null
    }

    function spawn(target) {
      const mesh = nextRandomAvailable()

      if (!mesh) return
      random.onCircle(random.range(5, 10), tmp2DArr)
      const x = target.x + tmp2DArr[0]
      const z = target.z + tmp2DArr[1]
      mesh.position.set(x, random.range(2, 4), z)
      mesh.scale.setScalar(random.range(1, 6))
      mesh.rotation.y = THREE.MathUtils.degToRad(45)
      mesh.material.uniforms.drawing.value = true
      mesh.material.uniforms.opacity.value = 0.4
      mesh.userData._lineThickness = random.range(0.3, 0.3)

      const wind = mesh.userData
      wind.duration = random.range(3, 3)

      group.add(mesh)
    }
  }

  resize() {
    const { width, height } = this.sizes
    this.pathLines.map(line => {
      line.updateResolution(width, height)
    })
  }

  update(delta) {
    this.processWind(delta)
  }
}

function getPaths() {
  return [
    'M1 73C48 80 154.8 89.8 206 73C270 52 259 19 238 7C217 -5 173 -1.90735e-06 176 26C179 52 191 76 277 80C363 84 421 67 444 65C467 63 530 73 561 73',
    'M1 13C50 16.3333 101 23 178 18C255 13 268 -0.999999 338 1C408 3 444 18 508 18',
    "M1 39C20 37.3333 64.6 35 91 39C124 44 226 49 246 44C266 39 280 16 263 6C246 -4 227 0.999995 228 14",
    'M1 18C40.3333 12 129 0.199994 169 0.999994C219 1.99999 346 18 399 18C452 18 512 0.999994 526 0.999994',
    'M1 5.99999C69.3333 2.33332 217.8 -2.80001 265 5.99999C324 17 421 -2.00003 462 5.99999'
  ]
}
