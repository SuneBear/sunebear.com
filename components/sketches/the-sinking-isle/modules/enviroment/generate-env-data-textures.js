import * as THREE from 'three'
import pointInPoly from 'point-in-polygon'
import stackblur from 'stackblur'
import euclideanDistanceSq from 'euclidean-distance/squared'

import { math } from '../../engine/utils'
import { point2DInsideBounds } from '../../utils/geometry'

export const generateEnvDataTextureMap = ({
  renderer,
  geo,
  width,
  height,
  bounds,
  random,
  groundColors,
  waterColors,
  enableDebug = false
}) => {
  convertCellPolysToColorIndex({ g: geo, groundColors, random})

  // Define functions
  function blur(context, width, height, iters = 1, radius = 8) {
    const imgData = context.getImageData(0, 0, width, height)
    for (let i = 0; i < iters; i++) {
      stackblur(imgData.data, width, height, radius)
    }
    context.putImageData(imgData, 0, 0)
  }

  function drawCanvas(canvas, context, textureSize, drawFn) {
    context.fillStyle = 'black'
    context.clearRect(0, 0, textureSize, textureSize)
    context.fillRect(0, 0, textureSize, textureSize)

    const [min, max] = bounds
    const fw = max[0] - min[0]
    const fh = max[1] - min[1]
    const sx = canvas.width / fw
    const sy = canvas.height / fh
    const zoom = 1.0

    context.save()
    context.scale(sx, sy)
    context.translate(width / 2, height / 2)
    context.scale(zoom, zoom)
    drawFn({ context, canvas })
    context.restore()
    return { context, canvas }
  }

  function drawChannelTexture({
    c,
    i,
    canvas,
    context,
    geo,
    groundColors,
    waterColors
  }) {
    const baseColor = new THREE.Color()

    if (c === 0 || c === 1) {
      geo.cells.forEach(p => {
        let color
        if (c === 0) {
          const r0 = random.range(-1, 1) * 0.2
          const r1 = random.range(-1, 1) * 0.2
          const r2 = random.range(-1, 1) * 0.2
          baseColor.setRGB(
            math.clamp01(p.moisture + r0),
            math.clamp01(p.elevation + r1),
            math.clamp01(p.distance + r2)
          )
          color = baseColor.getStyle()
        } else {
          color = p.color.getStyle()
        }
        context.fillStyle = context.strokeStyle = color
        context.beginPath()
        p.polygon.forEach(pt => context.lineTo(...pt))
        context.lineJoin = 'round'
        context.lineWidth = 1
        context.fill()
        context.stroke()
      })
    } else {
      geo.lakes.forEach((p, i) => {
        context.fillStyle = 'white'
        context.strokeStyle = c === 4 ? 'white' : 'black'
        context.beginPath()
        p.forEach(pt => context.lineTo(...pt))
        context.lineJoin = 'round'
        context.closePath()
        context.lineWidth = c === 4 ? 0.5 : 2
        context.fill()
        context.stroke()
      })
    }
  }

  function createChannelTextures(renderer, geo, groundColors, waterColors) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    return [0, 1, 2, 3, 4].map((c, i) => {
      let textureSize = c >= 2 ? 256 : 512
      if (c === 4) textureSize = 128
      canvas.width = textureSize
      canvas.height = textureSize
      drawCanvas(canvas, context, textureSize, ({ canvas, context }) =>
        drawChannelTexture({
          c,
          i,
          canvas,
          context,
          geo,
          groundColors,
          waterColors
        })
      )

      let iters = 2
      let radius = 4
      if (c === 2) {
        iters = 1
        radius = 2
      } else if (c === 3) {
        iters = 2
        radius = 8
      } else if (c === 4) {
        iters = 0
        radius = 0
      }
      if (iters > 0) {
        blur(context, textureSize, textureSize, iters, radius)
      }
      const tex = new THREE.Texture(canvas)
      if (enableDebug) {
        var img = new Image()
        img.src = canvas.toDataURL()
        document.body.appendChild(img)
      }
      tex.needsUpdate = true
      renderer.initTexture(tex)
      tex.image = null
      return tex
    })
  }

  // Generate
  const [
    biomeDataTexture,
    colorDataTexture,
    lakeDataTexture,
    lakeBlurDataTexture,
    lakeHardDataTexture
  ] = createChannelTextures(renderer, geo, groundColors, waterColors)

  return {
    biomeDataTexture,
    colorDataTexture,
    lakeDataTexture,
    lakeBlurDataTexture,
    lakeHardDataTexture
  }
}

function convertCellPolysToColorIndex({ g, groundColors, hasLakes = true, random }) {
  g.cells.forEach(p => {
    const { distance, lakeDistance, moisture, elevation } = p
    const m = moisture
    const e = elevation

    let colorIndex = 0
    if (hasLakes) {
      const lakeWetland = 10
      if (
        p.lengthFromCenter > lakeWetland &&
        (intersectsAnyLake(g, p.centroid, lakeWetland) ||
          p.polygon.some(pt => intersectsAnyLake(g, p.centroid, lakeWetland)))
      ) {
        // water
        colorIndex = 3
      } else {
        // non-water
        if (m < 0.5 && e >= 0.5) {
          // dry, high
          colorIndex = 0
        } else if (m < 0.5 && e < 0.5) {
          // dry, low
          colorIndex = 1
        } else {
          // wet, low/high
          colorIndex = 2
        }
      }
    } else {
      if (m < 0.5 && e >= 0.5) {
        // dry, high
        colorIndex = 0
      } else if (m < 0.5 && e < 0.5) {
        // dry, low
        colorIndex = 1
      } else if (m >= 0.5 && e >= 0.5) {
        // wet, high
        colorIndex = 2
      } else {
        // wet, low
        colorIndex = 3
      }
    }
    p.colorIndex = colorIndex

    const pt = 0.5
    const pf = 0.5
    const color = new THREE.Color()
    color.set(groundColors[p.colorIndex % groundColors.length].color)

    color.offsetHSL(0, 0, (p.elevation * 2 - 1) * 0.05)
    color.offsetHSL(0, 0, (p.moisture * 2 - 1) * 0.1)
    color.offsetHSL(
      random.range(-1, 1) * 0.01,
      random.range(-1, 1) * 0.01,
      (math.smoothstep(pt - pf, pt + pf, p.distance) * 2 - 1) * 0.1
    )
    p.color = color
  })
}

function intersectsAnyLake(geo, p, radius = 2) {
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
