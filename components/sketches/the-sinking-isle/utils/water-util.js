import { point2DInsideBounds } from './geometry'
import pointInPoly from 'point-in-polygon'

export function insideWaterPolys(lakeGeo, point) {
  for (let i = 0; i < lakeGeo.lakeInfos.length; i++) {
    const lake = lakeGeo.lakeInfos[i]
    if (
      point2DInsideBounds(point, lake.bounds) &&
      pointInPoly(point, lake.polygon)
    ) {
      return true
    }
  }
  return false
}

export function getLakeObject(lakeGeo, point) {
  for (let i = 0; i < lakeGeo.lakeInfos.length; i++) {
    const lake = lakeGeo.lakeInfos[i]
    if (
      point2DInsideBounds(point, lake.bounds) &&
      pointInPoly(point, lake.polygon)
    ) {
      return lake
    }
  }
  return null
}
