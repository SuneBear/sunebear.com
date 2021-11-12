import * as THREE from 'three'
import { MathUtils } from 'three'
import { GridBounds } from './enviroment/env-grid'
import Module from '../engine/module'
import { Random, ObjectPool } from '../engine/utils'
import { getLakeObject } from '../utils/water-util'
import { spliceOne } from '../utils/array'

export default class EnviromentGrid extends Module {
  constructor(sketch) {
    super(sketch)

    const defaultSeed = new Uint16Array(4)
    const randomPool = new ObjectPool({
      initialCapacity: 12,
      create() {
        return Random(defaultSeed, null)
      },
    })

    const tmp2DArray = [0, 0]
    const tmpBox = new THREE.Box3()
    const raycaster = new THREE.Raycaster()
    const mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0)
    const pos2D = new THREE.Vector2()
    const pos3D = new THREE.Vector3()
    const tmp3D = new THREE.Vector3()
    const corners = [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ]

    // Assign from env
    const cellActiveDataList = this.enviroment.cellActiveDataList
    const grid = this.enviroment.grid
    const gridBounds = new GridBounds()

    this.processEnvGrid = (dt) => {
      const underPlayer = this.player.underState
      const envState = this.enviroment.envState
      const target = this.player.targetPos
      const camera = this.camera

      camera.updateProjectionMatrix()

      // get min and max points on screen
      const maxRadialDistance = 80
      const maxAssetHeight = 12
      tmpBox.makeEmpty()
      for (let i = 0; i < corners.length; i++) {
        const uv = corners[i]
        pos2D.fromArray(uv)
        raycaster.setFromCamera(pos2D, camera)
        const hit = raycaster.ray.intersectPlane(mousePlane, pos3D)
        if (!hit) return // why??

        const delta = tmp3D.copy(pos3D).sub(target)
        const dist = delta.length()
        if (dist !== 0) delta.divideScalar(dist) // normalize

        if (dist > maxRadialDistance) {
          pos3D.copy(target).addScaledVector(tmp3D, maxRadialDistance)
        }
        tmpBox.expandByPoint(pos3D)
      }
      tmpBox.min.y = 0
      tmpBox.max.y = maxAssetHeight
      underPlayer.isInLake = false
      underPlayer.lake = null

      // check active environment...
      matchAgainstEnvironment(envState, grid)
    }

    const matchAgainstEnvironment = (state) => {
      const underPlayer = this.player.underState
      const grid = this.enviroment.grid

      grid.box3ToBounds(tmpBox, gridBounds)

      const padding = 0
      const padBottom = 1
      gridBounds.minX = MathUtils.clamp(
        gridBounds.minX - padding,
        0,
        grid.cellDivisions - 1
      )
      gridBounds.minY = MathUtils.clamp(
        gridBounds.minY - padding,
        0,
        grid.cellDivisions - 1
      )
      gridBounds.maxX = MathUtils.clamp(
        gridBounds.maxX + padding,
        0,
        grid.cellDivisions - 1
      )
      gridBounds.maxY = MathUtils.clamp(
        gridBounds.maxY + padding + padBottom,
        0,
        grid.cellDivisions - 1
      )

      // go through all active cells and remove any out of bounds
      cellActiveDataList.map((activeData, index) => {
        // cell has disappeared from view, turn it off
        if (
          activeData.environmentState !== state ||
          !grid.isCellInBounds(activeData.cell, gridBounds)
        ) {
          // console.log("kill cell");
          this.$vm.$emit('cellActiveDataList:remove', { activeData })
          randomPool.release(activeData.random) // release random func
          activeData.cell.activeData = null // release
          activeData.environmentState = null
          activeData.cell = null
          spliceOne(cellActiveDataList, index)
        }
      })

      // go through all the cells in view and add any activeData that appeared
      let cellsInViewCount = 0
      grid.forEachCellInBounds(gridBounds, (cell) => {
        cellsInViewCount++
        if (!cell.activeData) {
          const activeData = initActiveData()
          cell.activeData = activeData
          activeData.cell = cell
          activeData.environmentState = state
          activeData.random = randomPool.next()
          activeData.random.seed(cell.seed)
          cellActiveDataList.push(activeData)
          this.$vm.$emit('cellActiveDataList:add', { activeData })
        }
      })

      // Update player underState
      const position = this.player.position
      const lakeGeo = this.enviroment.lakeGeo

      tmp2DArray[0] = position.x
      tmp2DArray[1] = position.z
      const playerShowing = true
      if (!underPlayer.isInLake && playerShowing) {
        const lake = getLakeObject(lakeGeo, tmp2DArray)
        underPlayer.isInLake = Boolean(lake)
        underPlayer.lake = lake
      }
    }
  }

  update(delta) {
    this.processEnvGrid(delta)
  }
}

function initActiveData() {
  return {
    environmentState: null,
    cell: null,
    random: null,
    // StillLifeData
    children: []
  }
}
