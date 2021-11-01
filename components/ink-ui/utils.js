import { cssVar, Color } from '~/utils/color'
import { random } from '~/utils/random'

export function getInkNoiseColor(color, deltaFactor = 0.1) {
  if (process.server) {
    return color
  }
  if (color.startsWith('var(--')) {
    color = cssVar(color)
  }
  color = Color(color)
  color = color.lighten(random.range(-deltaFactor, deltaFactor))
  return color.hex()
}

export function getInkNoiseNumber(number, deltaFactor = 0.1) {
  const delta = number * deltaFactor
  return random.range(number - delta, number + delta)
}

export function getInkNoiseRangeFloor(min, max) {
  return random.rangeFloor(min, max)
}

