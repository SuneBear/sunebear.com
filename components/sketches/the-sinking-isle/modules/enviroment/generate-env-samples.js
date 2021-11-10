import { quadtree as Quadtree } from 'd3-quadtree'
import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling'
import euclideanDistance from 'euclidean-distance'
import euclideanDistanceSq from 'euclidean-distance/squared'
import pointInPoly from 'point-in-polygon'
import scaleAndAdd2D from "gl-vec2/scaleAndAdd"
import rotate2D from "gl-vec2/rotate"
import { intersectsAnyLake, createTerrain } from './shared'
import { math } from '../../engine/utils'
import { point2DInsideBounds } from '../../utils/geometry'

const ignoreCenterSampleRadius = 25
const ignoreCenterTokenRadius = 45
const ignoreCenterTokenRadiusSq =
  ignoreCenterTokenRadius * ignoreCenterTokenRadius

export const generateEnvSamples = ({ envState, geo, grid }) => {
  const { width, height, hasLakes, bounds, hasIce } = envState
  const { random, noise01, noise02 } = geo

  const tokensAwayFromCenter = random.shuffle(
    geo.tokens.filter(t => {
      const lenSq = euclideanDistanceSq(t.position, [0, 0])
      return random.chance(0.7) && lenSq >= ignoreCenterTokenRadiusSq
    })
  )

  const maxPatches = Math.round(0.75 * tokensAwayFromCenter.length)
  const patches = []

  const quadtree = Quadtree()
    .x(d => d.centroid[0])
    .y(d => d.centroid[1])
  quadtree.extent(bounds)
  quadtree.addAll(geo.cells)
  setGridPixels(quadtree, grid)

  // @TODO: Define MetaData
  const MetaData = {}
  const patchNames = Object.keys(MetaData).filter(key => {
    return MetaData[key].type === biomeData.name && !key.includes('items')
  })
  const patchDeck = random.deck(patchNames)
  for (
    let i = 0;
    i < tokensAwayFromCenter.length && patches.length < maxPatches;
    i++
  ) {
    const t = tokensAwayFromCenter[i]
    if (!intersectsAnyLake(geo, t.position, 4)) {
      const pos = t.position.slice()

      const name = patchDeck.current
      const patchInfo = MetaData[name]

      if (!patchInfo) {
        continue
      }

      const circlePoints = math.linspace(8).map(t => {
        const angle = Math.PI * 2 * t
        return [
          Math.cos(angle) * patchInfo.boundingCircle.radius + pos[0],
          Math.sin(angle) * patchInfo.boundingCircle.radius + pos[1]
        ]
      })

      // if any of the circle points hit a lake
      if (circlePoints.some(o => intersectsAnyLake(geo, o, 4))) {
        continue
      }

      const patch = {
        name,
        position: pos
      }
      patches.push(patch)

      const offset = patchInfo.boundingCircle.radius * 0.85
      t.position[1] += offset

      patchDeck.next()
    }
  }

  const activeTokens = tokensAwayFromCenter.filter(
    t =>
      t.active !== false &&
      point2DInsideBounds(t.position, bounds) &&
      !intersectsAnyLake(geo, t.position, 4)
  )

  let allSamples = createSamples(
    geo,
    patches,
    activeTokens,
    random,
    noise01,
    noise02
  )
  let samples = [] // GroundSamples
  let waterSamples = []
  allSamples.map(s => {
    if (intersectsAnyLake(geo, s, 1)) {
      // waterSamples.push(s)
    } else {
      if (hasIce && random.chance(0.5)) return
      samples.push(s)
    }
  })

  if (hasLakes) {
    geo.lakeBounds.map((bounds, i) => {
      const [min, max] = bounds
      const w = max[0] - min[0]
      const h = max[1] - min[1]
      const disk = new FastPoissonDiskSampling(
        {
          shape: [w, h],
          tries: 10,
          radius: 10
        },
        random.value
      )
      const lakeSamplePoints = disk
        .fill()
        .map(p => {
          return [min[0] + p[0], min[1] + p[1]]
        })
        .filter(p => {
          const isInLake =
            point2DInsideBounds(p, bounds) && pointInPoly(p, geo.lakes[i])
          if (isInLake) {
            const ptDist = 2.5
            const ptSq = ptDist * ptDist
            // only if none hit edge
            if (!geo.lakes[i].some(o => euclideanDistanceSq(o, p) < ptSq)) {
              return true
            }
          }
          return false
        })
      lakeSamplePoints.forEach(s => {
        waterSamples.push(s)
      })
    })
  }

  // Update tokens via features, and filter by edist
  const features = [] // @TODO: Defines token features
  const tokens = activeTokens
    .filter(p => {
      const [min, max] = bounds
      const edist = 15
      return (
        Math.abs(p.position[0] - min[0]) > edist &&
        Math.abs(p.position[1] - min[1]) > edist &&
        Math.abs(p.position[0] - max[0]) > edist &&
        Math.abs(p.position[1] - max[1]) > edist
      )
    })
    .map(p => {
      return {
        position: p.position,
        type: random.pick(features)
      }
    })

  // Step: Set tokens and samples to grid and geo
  setGridSamples(quadtree, grid, samples, waterSamples)

  geo.tokens = tokens

  tokens.map((t, i) => {
    const [x, y] = t.position
    const cell = grid.getCellAt(x, y)
    cell.tokens.push(i)
  })

  // patches.push({
  //   name: 'origin-patch-0',
  //   position: [0, 0]
  // })

  patches.map((p, i) => {
    const [x, y] = p.position
    const cell = grid.getCellAt(x, y)
    cell.patches.push(i)
  })

  // Final, return data
  return {
    patches,
    samples,
    waterSamples
  }

  // Define closure functions
  function createSamples(geo, patches, activeTokens, random, noise01, noise02) {
    const sampleRadius = 1.5
    const sampleDisk = new FastPoissonDiskSampling(
      {
        shape: [width, height],
        tries: 10,
        radius: sampleRadius * 2
      },
      random.value
    )
    const tmpNormal = [0, 0]
    const tmpPerp = [0, 0]
    const tmpPoint = [0, 0]
    const tmpSample = [0, 0]
    const tmpRotNorm = [0, 0]
    const tmpOffset2D = [0, 0]
    geo.segments.forEach(([a, b]) => {
      getSegmentNormal(tmpNormal, a, b)
      getPerpendicular(tmpPerp, tmpNormal)

      const len = euclideanDistance(a, b)

      const { elevation, moisture } = createTerrain(
        width,
        height,
        noise01,
        noise02,
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2
      )

      const spacing = math.lerp(0.25, 20, elevation)
      const count = Math.max(2, Math.ceil(len / spacing))
      for (let i = 0; i < count; i++) {
        let t = i / (count - 1)
        t = math.lerp(0.0, 1, t)

        const steps = random.rangeFloor(1, 6)
        for (let k = 0; k < steps; k++) {
          const p = math.lerpArray(a, b, t, tmpPoint)
          p[0] += width / 2
          p[1] += height / 2

          const radius = Math.abs(random.gaussian(1, 1))
          scaleAndAdd2D(p, p, random.insideCircle(radius, tmpOffset2D), 1)

          const dist = random.range(15, 20) + Math.abs(random.gaussian(0, 5))
          for (let j = 0; j < 2; j++) {
            const x = j === 0 ? -1 : 1
            const angleOff = 45
            rotate2D(
              tmpRotNorm,
              tmpPerp,
              math.degToRad(random.range(-angleOff, angleOff))
            )
            scaleAndAdd2D(tmpSample, p, tmpRotNorm, dist * x)

            if (!sampleDisk.inNeighbourhood(tmpSample)) {
              scaleAndAdd2D(
                tmpSample,
                tmpSample,
                random.insideCircle(
                  random.range(0.0 * sampleRadius, 1 * sampleRadius),
                  tmpOffset2D
                ),
                1
              )
              sampleDisk.addPoint(tmpSample)
            }
          }
        }
      }
    })
    const centerRadius = ignoreCenterSampleRadius
    const centerSq = centerRadius * centerRadius

    const samples = sampleDisk.samplePoints.map(p => {
      return [-width / 2 + p[0], -height / 2 + p[1]]
    })
    return samples.filter(p => {
      const tokenRadius = 2
      const tokenRadiusSq = tokenRadius * tokenRadius
      return (
        !activeTokens.some(
          t => euclideanDistanceSq(t.position, p) < tokenRadiusSq
        ) &&
        !patches.some(patch => {
          const patchInfo =
            patch.name in MetaData ? MetaData[patch.name] : false
          if (patchInfo) {
            const radius = patchInfo.boundingCircle.radius
            return circlesIntersect(p, 1, patch.position, radius)
          } else {
            return false
          }
        }) &&
        euclideanDistanceSq(p, [0, 0]) > centerSq
      )
    })
  }

  function getPerpendicular(out = [], a) {
    out[0] = -a[1]
    out[1] = a[0]
    return out
  }

  function getSegmentNormal(out = [], a, b) {
    let dx = b[0] - a[0]
    let dy = b[1] - a[1]
    const mlen2 = dx * dx + dy * dy
    if (mlen2 !== 0) {
      // normalize vector to unit length
      const len = Math.sqrt(mlen2)
      dx /= len
      dy /= len
    }
    out[0] = dx
    out[1] = dy
    return out
  }

  function setGridSamples(quadtree, grid, samples, waterSamples) {
    samples.forEach((s, i) => {
      const cell = grid.getCellAt(s[0], s[1])
      if (cell) cell.samples.push(i)
    })
    waterSamples.forEach((s, i) => {
      const cell = grid.getCellAt(s[0], s[1])
      if (cell) cell.waterSamples.push(i)
    })
    for (let y = 0; y < grid.cellDivisions; y++) {
      for (let x = 0; x < grid.cellDivisions; x++) {
        const u = x / (grid.cellDivisions - 1)
        const v = y / (grid.cellDivisions - 1)
        const wx = math.lerp(-width / 2, width / 2, u)
        const wz = math.lerp(-height / 2, height / 2, v)
        const cell = quadtree.find(wx, wz)
        const c = grid.cells[x + y * grid.cellDivisions]
        c.elevation = cell.elevation
        c.moisture = cell.moisture
        c.path = cell.distance
        c.colorIndex = cell.colorIndex
      }
    }
  }

  function setGridPixels(quadtree, grid) {
    for (let y = 0; y < grid.colorDivisions; y++) {
      for (let x = 0; x < grid.colorDivisions; x++) {
        const u = x / (grid.colorDivisions - 1)
        const v = y / (grid.colorDivisions - 1)
        const wx = math.lerp(-width / 2, width / 2, u)
        const wz = math.lerp(-height / 2, height / 2, v)
        const cell = quadtree.find(wx, wz)
        grid.colorIndices[x + y * grid.colorDivisions] = cell.colorIndex
      }
    }
  }
}
