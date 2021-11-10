import pointInPoly from 'point-in-polygon'
import euclideanDistanceSq from 'euclidean-distance/squared'
import { math } from '../../engine/utils'
import { point2DInsideBounds } from '../../utils/geometry'

export function intersectsAnyLake(geo, p, radius = 2) {
  for (let i = 0; i < geo.lakeBounds.length; i++) {
    if (intersectsLakeIndex(geo, p, i, radius)) {
      return true
    }
  }
  return false
}

function intersectsLakeIndex(geo, p, i, radius = 2) {
  const ptSq = radius * radius
  const b = geo.lakeBounds[i]
  if (point2DInsideBounds(p, b)) {
    if (pointInPoly(p, geo.lakes[i])) {
      return true
    }
  }
  if (geo.lakes[i].some(o => euclideanDistanceSq(o, p) < ptSq)) {
    return true
  }
  return false
}

export function createTerrain(width, height, noise01, noise02, x, y) {
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
