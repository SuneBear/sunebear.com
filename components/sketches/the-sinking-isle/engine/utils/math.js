// @REF: https://github.com/mattdesl/canvas-sketch-util/blob/master/math.js
export const clamp = (value, min, max) => {
  if (value < min) {
    return min
  } else if (value > max) {
    return max
  }

  return value
}

export const saturate = value => {
  return clamp(value, 0, 1)
}

export const clamp01 = saturate

// Get the linear interpolation between two value
export const lerp = (min, max, t) => {
  return min * (1 - t) + max * t
}

export const inverseLerp = (min, max, t) => {
  if (Math.abs(min - max) < Number.EPSILON) return 0
  else return (t - min) / (max - min)
}

export const smoothstep = (min, max, t) => {
  var x = clamp(inverseLerp(min, max, t), 0, 1)
  return x * x * (3 - 2 * x)
}

export const mod = (a, b) => {
  return ((a % b) + b) % b
}

export const sign = n => {
  if (n > 0) return 1
  else if (n < 0) return -1
  else return 0
}

export const degToRad = n => {
  return (n * Math.PI) / 180
}

export const radToDeg = n => {
  return (n * 180) / Math.PI
}

export const damp = (a, b, lambda, dt) => {
  return lerp(a, b, 1 - Math.exp(-lambda * dt))
}

export const dampVector = (a, b, power, dt, output = a) => {
  output.x = damp(a.x, b.x, power, dt)
  output.y = damp(a.y, b.y, power, dt)
  output.z = damp(a.z, b.z, power, dt)
  return output
}

export const map = (value, low1, high1, low2, high2) => {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

export const mapRange = (
  value,
  inputMin,
  inputMax,
  outputMin,
  outputMax,
  clamp
) => {
  // Reference:
  // https://openframeworks.cc/documentation/math/ofMath/
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
    return outputMin
  } else {
    var outVal =
      ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
      outputMin
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax
        else if (outVal > outputMin) outVal = outputMin
      } else {
        if (outVal > outputMax) outVal = outputMax
        else if (outVal < outputMin) outVal = outputMin
      }
    }
    return outVal
  }
}

export const deltaAngle = (current, target) => {
  let num = repeat(target - current, Math.PI * 2)
  if (num > Math.PI) num -= Math.PI * 2
  return num
}

export const repeat = (t, length) => {
  return t - Math.floor(t / length) * length
}

export const wrapAngle = angle => {
  let n = repeat(angle, Math.PI * 2)
  if (n > Math.PI) n -= Math.PI * 2
  return n
}

export const lerpAngle = (a, b, t) => {
  let delta = repeat(b - a, Math.PI * 2)
  if (delta > Math.PI) delta -= Math.PI * 2
  return a + delta * clamp01(t)
}

export const lerpArray = (min, max, t, out) => {
  out = out || []
  if (min.length !== max.length) {
    throw new TypeError(
      'min and max array are expected to have the same length'
    )
  }
  for (var i = 0; i < min.length; i++) {
    out[i] = lerp(min[i], max[i], t)
  }
  return out
}

export const dampAngle = (a, b, lambda, dt) => {
  const delta = deltaAngle(a, b)
  const t = 1 - Math.exp(-lambda * dt)
  return a + delta * t
}

export const linspace = (n = 0, opts = {}) => {
  if (typeof n !== 'number')
    throw new TypeError('Expected n argument to be a number')
  opts = opts || {}
  if (typeof opts === 'boolean') {
    opts = { endpoint: true }
  }
  const offset = opts.offset || 0
  if (opts.endpoint) {
    return [...Array(n)].map(function(_, i) {
      return n <= 1 ? 0 : (i + offset) / (n - 1)
    })
  } else {
    return [...Array(n)].map(function(_, i) {
      return (i + offset) / n
    })
  }
}
