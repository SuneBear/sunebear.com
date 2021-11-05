const euclideanDist = require('euclidean-distance')

export function getMinimumSpanningTree(items, distFunc, opt = {}) {
  const { maxSteps = Infinity } = opt
  if (items.length <= 1) return []
  distFunc = distFunc || euclideanDist
  let indices = new Map()
  items.forEach((c, i) => {
    indices.set(c, i)
  })
  let connected = new Set(items.slice(0, 1))
  let remaining = new Set(items.slice(1))
  let connections = new Map()
  let steps = 0
  let results = []
  while (remaining.size != 0 && steps++ < maxSteps) {
    if (steps > maxSteps - 1) console.warn('Infinite loop')
    const result = findWithDistance(connected, remaining, distFunc)
    if (!result || !isFinite(result.distance)) continue

    const { from, to, distance } = result

    let keys = [indices.get(from), indices.get(to)]
    const indexList = keys.slice()
    keys.sort()
    const key = keys.join(':')
    if (!connections.has(key)) {
      connections.set(key, true)
      results.push({ ...result, indices: indexList, key })
      connected.add(to)
      remaining.delete(to)
    }
  }
  return results
}

function findWithDistance(connected, remaining, distanceFn) {
  let minDist = Infinity
  let from, candidate
  for (let a of connected) {
    for (let b of remaining) {
      let dist = distanceFn(a, b)
      if (dist < minDist) {
        minDist = dist
        from = a
        candidate = b
      }
    }
  }
  return { from, to: candidate, distance: minDist }
}
