export function point2DInsideBounds(p, bounds) {
  const [x, y] = p
  const [min, max] = bounds
  return x >= min[0] && x < max[0] && y >= min[1] && y < max[1]
}
