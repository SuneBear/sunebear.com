import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling'
import getPointBounds from 'bound-points'
import simplify from 'simplify-path'
import boundPoints from 'bound-points'
import euclideanDistance from 'euclidean-distance'
import euclideanDistanceSq from 'euclidean-distance/squared'
import { polygonCentroid } from 'd3-polygon'
import { Delaunay } from 'd3-delaunay'

import { math, Random } from '../../engine/utils'
import { getMinimumSpanningTree } from '../../utils/min-spanning-tree'
import concaveman from 'concaveman'

export const generateLakeGeo = ({
  width,
  height,
  bounds,
  seed,
  maxTokens = 0,
  maxLakes = 20
}) => {
  const state = new Uint16Array(seed) // Random.getRandomState()
  const random = Random(state)
  const noise01 = new SimplexNoise(random.value)
  const noise02 = new SimplexNoise(random.value)
  const tmp2DArray = [0, 0]

  const flatBounds = bounds.flat()
  const featureRadius = 4
  const lakeSpacing = 0
  const lakeGap = lakeSpacing

  // Step: Tokens & Features, Lakes Position
  const tokenZones = random.shuffle(
    getRandomFeatures(width, height, featureRadius, random)
  )
  let tokens = tokenZones.map(feature => {
    const position = feature.slice()
    const offset = random.insideCircle(featureRadius * 0.5, tmp2DArray)
    position[0] += offset[0]
    position[1] += offset[1]
    return {
      center: feature,
      radius: featureRadius,
      position
    }
  })

  let lakes = getRandomFeatures(width, height, lakeSpacing, random)
  lakes = random
    .shuffle(
      lakes.filter(t => {
        return euclideanDistance(t, [0, 0]) > featureRadius * 4
      })
    )
    .slice(0, maxLakes)

  tokens = tokens.filter(t => {
    const d = euclideanDistance(t.position, [0, 0])
    for (let i = 0; i < lakes.length; i++) {
      const dlake = euclideanDistance(t.position, lakes[i])
      if (dlake < lakeGap / 2) return false
    }
    const absX = Math.abs(t.position[0])
    const absY = Math.abs(t.position[1])
    const margin = 0.95
    return absX < (width / 2) * margin && absY < (height / 2) * margin
  }).slice(0, maxTokens)

  // Step: Generate Polys
  const connections = getMinimumSpanningTree(
    tokens.map(t => t.position),
    (a, b) => euclideanDistanceSq(a, b)
  ).map(c => c.indices)
  const segments = connections.map(c => {
    const connection = c.map(i => tokens[i])
    return connection.map(t => t.position)
  })
  const dpoints = segments
    .map(segment => {
      const count = random.rangeFloor(5, 5)
      const points = []
      for (let i = 0; i < count; i++) {
        const t = i / count
        const p = math.lerpArray(segment[0], segment[1], t)
        random.insideCircle(featureRadius / 8, tmp2DArray)
        p[0] += tmp2DArray[0]
        p[1] += tmp2DArray[1]
        points.push(p)
      }
      return points
    })
    .flat()
  const delaunayPoints = generateRandomPointsFast(width, height, 1, random)
  const delaunay = Delaunay.from(delaunayPoints)
  const relaxations = 2
  for (let i = 0; i < relaxations; i++) {
    relax(flatBounds, delaunay, 0.5)
  }
  const voronoi = delaunay.voronoi(flatBounds)
  const cells = Array.from(voronoi.cellPolygons()).map((polygon, i) => {
    const index = polygon.index
    if (index !== i) console.error("ERR! poly index doesn't match")
    polygon = Array.from(polygon).slice(0, polygon.length - 1)
    return polygon
  })
  const centroids = cells.map(c => polygonCentroid(c))
  const distances = centroids.map(c => {
    return metaballDistance(c[0], c[1], dpoints, featureRadius)
  })
  const lakeDistances = centroids.map(c => {
    return metaballDistance(c[0], c[1], lakes, lakeGap / 4, 1, 1.5)
  })
  const polys = cells.map((c, i) => {
    const centroid = centroids[i]
    const { elevation, moisture } = createTerrain(
      width,
      height,
      noise01,
      noise02,
      centroid[0],
      centroid[1]
    )

    const distance = distances[i]
    const lakeDistance = lakeDistances[i]
    return {
      polygon: c,
      centroid,
      connections,
      segments,
      distance,
      lakeDistance,
      moisture,
      elevation
    }
  })
  normalizeAttr(polys, 'moisture')
  normalizeAttr(polys, 'elevation')
  normalizeAttr(polys, 'lakeDistance')
  normalizeAttr(polys, 'distance')

  // Step: Generate Lake Contours
  const lakePolys = new Set()
  polys.map((p, i) => {
    const { distance, moisture, elevation, lakeDistance } = p
    const m = moisture
    const e = elevation
    const length = euclideanDistance([0, 0], centroids[i])

    p.centroid = centroids[i]
    p.lengthFromCenter = length

    if (
      length > 40 &&
      distance < 0.25 &&
      ((m > 0.5 && e < 0.5) || lakeDistance > 0.5)
    ) {
      lakePolys.add(i)
    }
  })

  const lakeSets = convertLakeIndicesToSets(voronoi, lakePolys)
  const lakeHulls = lakeSets
    .filter(set => {
      return set.length > 2
    })
    .map(set => convertSetToHull(polys, set, random))
  const lakeContours = lakeHulls
    .map(hull => {
      const p = simplify(hull, 1)
      if (p.length) p.pop() // remove closing point
      return p
    })
    .filter(c => {
      return c.length > 4
    })
    .map(c => {
      const points3D = c.map(p => new THREE.Vector3(p[0], 0, p[1]))
      return new THREE.CatmullRomCurve3(points3D, true, 'chordal', 0.5)
        .getSpacedPoints(c.length * 8)
        .map(t => [t.x, t.z])
    })

  const lakeInfos = lakeContours.map((poly) => {
    return {
      bounds: boundPoints(poly),
      centroid: polygonCentroid(poly),
      polygon: poly,
    }
  })

  return {
    lakes: lakeContours,
    lakeInfos,
    lakeBounds: lakeInfos.map(info => info.bounds),
    segments,
    cells: polys
  }
}

function convertLakeIndicesToSets(voronoi, indices) {
  const touchedPolys = new Set()
  const lakeSets = new Set()
  indices.forEach(i => {
    if (!touchedPolys.has(i)) {
      const allTouching = findAllLakeNeighbors(
        voronoi,
        indices,
        i,
        touchedPolys
      )
      // const lakeCandidates = []
      allTouching.forEach(j => {
        // mark all these as touched
        touchedPolys.add(j)
      })
      lakeSets.add([...allTouching])
    }
  })

  return [...lakeSets]
}

function convertSetToHull(polys, set, random) {
  const verts = []
  set.forEach(i => {
    const [min, max] = getPointBounds(polys[i].polygon)
    const w = max[0] - min[0]
    const h = max[1] - min[1]
    const r = Math.min(w, h) * 0.5
    const angleOff = random.range(-1, 1) * Math.PI * 2
    const newPoints = math.linspace(8).map(t => {
      const angle = t * 2 * Math.PI + angleOff
      const x = min[0] + w / 2 + Math.cos(angle) * r
      const y = min[1] + h / 2 + Math.sin(angle) * r
      verts.push([x, y])
    })
  })
  return concaveman(verts)
}

function findAllLakeNeighbors(voronoi, lakePolys, i, excluding) {
  const set = new Set()
  const polysToTest = [i]
  while (polysToTest.length > 0) {
    // add this node to the set
    const t = polysToTest.shift()
    set.add(t)
    // now find its neighbors
    for (let j of voronoi.neighbors(t)) {
      // if the neighbor is a lake and we haven't seen it yet
      if (lakePolys.has(j) && !set.has(j) && !excluding.has(j)) {
        // add it to our set
        set.add(j)
        // also we have to now walk its neighbors to see if any more match
        polysToTest.push(j)
      }
    }
  }
  return set
}

function normalizeAttr(cells, attr) {
  const max = cells.reduce((max, cell) => Math.max(max, cell[attr]), -Infinity)
  const min = cells.reduce((min, cell) => Math.min(min, cell[attr]), Infinity)
  if (max !== min) {
    cells.forEach(c => {
      c[attr] = math.mapRange(c[attr], min, max, 0, 1, true)
    })
  }
}

function metaballDistance(
  x,
  y,
  centroids,
  radius,
  minScale = 1,
  maxScale = 1.5,
  power = 0.5
) {
  let sum = 0
  for (let i = 0; i < centroids.length; i++) {
    const c = centroids[i]
    const dx = x - c[0]
    const dy = y - c[1]
    const d2 = dx * dx + dy * dy
    let dst = d2 === 0 ? 0 : Math.sqrt(d2)
    const minDist = radius * minScale
    const maxDist = radius * maxScale
    const alpha = math.clamp01(math.inverseLerp(minDist, maxDist, dst))
    sum += 1 - Math.pow(alpha, power)
  }
  return sum
}

function generateRandomPointsFast(width, height, spacing, random) {
  const countWidth = Math.max(1, Math.ceil(width / spacing))
  const countHeight = Math.max(1, Math.ceil(height / spacing))
  const factor = 5
  const N = Math.round(Math.max(countWidth, countHeight) * factor)
  return math.linspace(N).map(() => {
    return [
      random.range(-width / 2, width / 2),
      random.range(-height / 2, height / 2)
    ]
  })
}

function getRandomFeatures(width, height, radius, random) {
  const disk = new FastPoissonDiskSampling(
    {
      shape: [width, height],
      tries: 10,
      radius: radius * 2
    },
    random.value
  )
  disk.addPoint([width / 2, height / 2])
  return disk.fill().map(p => {
    return [-width / 2 + p[0], -height / 2 + p[1]]
  })
}

function relax(flatBounds, delaunay, relaxationParameter = 0.5) {
  const voronoi = delaunay.voronoi(flatBounds)
  for (let i = 0; i < delaunay.points.length; i += 2) {
    const cell = voronoi.cellPolygon(i >> 1)
    if (cell === null) continue
    const x0 = delaunay.points[i]
    const y0 = delaunay.points[i + 1]
    const [x1, y1] = polygonCentroid(cell)
    delaunay.points[i] = x0 + (x1 - x0) * relaxationParameter
    delaunay.points[i + 1] = y0 + (y1 - y0)
  }
  delaunay.update()
}

function createTerrain(width, height, noise01, noise02, x, y) {
  const params = { f1: 2, t1: 4, k1: 0.5, f2: 2, t2: 4, k2: 0.25 }
  const { t1, f1, k1, t2, f2, k2 } = params
  const aspect = width / height
  let u = math.inverseLerp(-width / 2, width / 2, x)
  let v = math.inverseLerp(-height / 2, height / 2, y)
  u *= aspect
  const elevation = math.lerp(
    Math.pow(layeredNoise3D(noise01, u, v, 0, t1), 1.2),
    noise01.noise2D(u * f1, v * f1) * 0.5 + 0.5,
    k1
  )

  const moisture = math.lerp(
    Math.pow(layeredNoise3D(noise02, u, v, 0, t2), 1),
    noise02.noise2D(u * f2, v * f2) * 0.5 + 0.5,
    k2
  )
  return { elevation, moisture }
}

function layeredNoise3D(simplex, px, py, z = 0, uvFreq = 0.1) {
  // This uses many layers of noise to create a more organic pattern
  const nx = px * uvFreq
  const ny = py * uvFreq
  let e =
    1.0 * (simplex.noise3D(1 * nx, 1 * ny, z) * 0.5 + 0.5) +
    0.5 * (simplex.noise3D(2 * nx, 2 * ny, z) * 0.5 + 0.5) +
    0.25 * (simplex.noise3D(4 * nx, 4 * ny, z) * 0.5 + 0.5) +
    0.13 * (simplex.noise3D(8 * nx, 8 * ny, z) * 0.5 + 0.5) +
    0.06 * (simplex.noise3D(16 * nx, 16 * ny, z) * 0.5 + 0.5) +
    0.03 * (simplex.noise3D(32 * nx, 32 * ny, z) * 0.5 + 0.5)
  e /= 1.0 + 0.5 + 0.25 + 0.13 + 0.06 + 0.03
  return e
}
