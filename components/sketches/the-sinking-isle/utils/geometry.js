export function point2DInsideBounds(p, bounds) {
  const [x, y] = p
  const [min, max] = bounds
  return x >= min[0] && x < max[0] && y >= min[1] && y < max[1]
}

export function circlesIntersect(positionA, radiusA, positionB, radiusB) {
  const dx = positionA[0] - positionB[0]
  const dy = positionA[1] - positionB[1]
  const dsq = dx * dx + dy * dy
  const r = radiusA + radiusB
  const rsq = r * r
  return dsq <= rsq
}
