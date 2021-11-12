const baseWeights = {
  flower: 50,
  tree: 75,
  twig: 25,
  // grass: 25,
  acorns: 10,
  stump: 25,
  shroom: 25,
  rock: 50,
  'flower-patch': 10,
  sapling: 20
}

export function getWeightedSets(instances) {
  const setMap = new Map()
  const items = instances
    .filter(child => child.userData.tag)
    .map(child => {
      const tag = child.userData.tag
      let list
      if (setMap.has(tag)) {
        list = setMap.get(tag)
      } else {
        list = []
        setMap.set(tag, list)
      }
      list.push(child)
      return {
        tag,
        child
      }
    })

  return Array.from(setMap.entries()).map(([tag, children]) => {
    const weight = tag in baseWeights ? baseWeights[tag] : 50
    return {
      value: children,
      weight,
      tag
    }
  })
}

export function addSampleData(itemsMap, stillLifeData, itemCollection, random) {
  if (!itemsMap) return

  if (!itemsMap.has(itemCollection)) {
    console.warn(`No item collection by key ${itemCollection}`)
    return
  }

  const items = itemsMap.get(itemCollection)
  if (!items || !items.sets || !items.sets.length) {
    console.warn(`Cell not yet ready ${itemCollection}`)
    return
  }

  const set = random.weightedSet(items.sets)

  const child = items.next(random.pick(set))
  if (!child || !child.userData.tag) {
    if (child) console.warn('no tag for', child.name, itemCollection)
    return
  }

  // console.log("Spawning child", child.userData.tag)
  const key = child.uuid

  const data = stillLifeData
  data.key = key
  data.variance = random.gaussian(0, 1)
  data.rotation = random.range(-1, 1) * Math.PI * 2
  data.flip = random.boolean()
  data.instance = child
  data.audio = child.scale.y > 5
  data.ignoreFlip = child.userData.tag === 'tree'

  return child
}
