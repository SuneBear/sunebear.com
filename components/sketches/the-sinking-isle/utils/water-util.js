import { point2DInsideBounds } from './geometry'
import pointInPoly from 'point-in-polygon'

export function insideWaterPolys(state, point) {
  if (!state.hasLakes) return false
  for (let i = 0; i < state.lakes.length; i++) {
    const lake = state.lakes[i]
    if (
      point2DInsideBounds(point, lake.bounds) &&
      pointInPoly(point, lake.polygon)
    ) {
      return true
    }
  }
  return false
}

export function getLakeObject(state, point) {
  if (!state.hasLakes) return null
  for (let i = 0; i < state.lakes.length; i++) {
    const lake = state.lakes[i]
    if (
      point2DInsideBounds(point, lake.bounds) &&
      pointInPoly(point, lake.polygon)
    ) {
      return lake
    }
  }
  return null
}
