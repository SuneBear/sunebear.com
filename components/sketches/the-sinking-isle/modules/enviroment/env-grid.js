import { math } from '../../engine/utils'

export class EnvironmentCell {
  constructor(seed, x, y, cx, cy) {
    this.samples = []
    this.waterSamples = []
    this.patches = []
    this.tokens = []
    this.seed = seed
    this.moisture = 0
    this.elevation = 0
    this.path = 0
    this.colorIndex = 0
    this.x = x
    this.y = y
    this.cx = cx
    this.cy = cy
    this.activeData = null
  }
}

export class GridBounds {
  constructor(minX, minY, maxX, maxY) {
    this.minX = minX
    this.minY = minY
    this.maxX = maxX
    this.maxY = maxY
  }
}

export class EnvironmentGrid {
  constructor(random, colors, size, cellTileSize, colorTileSize) {
    this.size = size
    this.cellDivisions = Math.ceil(this.size / cellTileSize)
    this.colorDivisions = Math.ceil(this.size / colorTileSize)
    this.cellTileSize = this.size / this.cellDivisions
    this.colorTileSize = this.size / this.colorDivisions
    this.colors = colors
    this.colorIndices = new Uint8Array(
      this.colorDivisions * this.colorDivisions
    )
    this.cells = new Array(this.cellDivisions * this.cellDivisions)
    for (let i = 0; i < this.cells.length; i++) {
      const seed = new Uint16Array(4)
      for (let i = 0; i < 4; i++) {
        seed[i] = random.value() * 0x10000
      }
      const x = Math.floor(i % this.cellDivisions)
      const y = Math.floor(i / this.cellDivisions)
      const cx = -this.size / 2 + x * this.cellTileSize + this.cellTileSize / 2
      const cy = -this.size / 2 + y * this.cellTileSize + this.cellTileSize / 2
      this.cells[i] = new EnvironmentCell(seed, x, y, cx, cy)
    }
  }

  box3ToBounds(box3, bounds = new GridBounds()) {
    const min = box3.min
    const max = box3.max
    const minU = math.inverseLerp(-this.size / 2, this.size / 2, min.x)
    const minV = math.inverseLerp(-this.size / 2, this.size / 2, min.z)
    const maxU = math.inverseLerp(-this.size / 2, this.size / 2, max.x)
    const maxV = math.inverseLerp(-this.size / 2, this.size / 2, max.z)
    bounds.minX = math.clamp(
      Math.floor(minU * this.cellDivisions),
      0,
      this.cellDivisions - 1
    )
    bounds.minY = math.clamp(
      Math.floor(minV * this.cellDivisions),
      0,
      this.cellDivisions - 1
    )
    bounds.maxX = math.clamp(
      Math.floor(maxU * this.cellDivisions),
      0,
      this.cellDivisions - 1
    )
    bounds.maxY = math.clamp(
      Math.floor(maxV * this.cellDivisions),
      0,
      this.cellDivisions - 1
    )
    return bounds
  }

  forEachCellInBounds(bounds, cb) {
    const { maxX, maxY, minX, minY } = bounds
    const xCells = maxX - minX
    const yCells = maxY - minY
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const idx = x + y * this.cellDivisions
        const cell = this.cells[idx]
        cb(cell)
      }
    }
  }

  isCellInBounds(cell, bounds) {
    const { maxX, maxY, minX, minY } = bounds
    return cell.x >= minX && cell.x <= maxX && cell.y >= minY && cell.y <= maxY
  }

  getCellAt(x, z) {
    const u = math.inverseLerp(-this.size / 2, this.size / 2, x)
    const v = math.inverseLerp(-this.size / 2, this.size / 2, z)
    const ix = Math.floor(u * this.cellDivisions)
    const iy = Math.floor(v * this.cellDivisions)
    const idx = ix + iy * this.cellDivisions
    return this.cells[idx]
  }

  getColorAt(x, z) {
    const u = math.inverseLerp(-this.size / 2, this.size / 2, x)
    const v = math.inverseLerp(-this.size / 2, this.size / 2, z)
    const ix = Math.floor(u * this.colorDivisions)
    const iy = Math.floor(v * this.colorDivisions)
    const idx = ix + iy * this.colorDivisions
    return this.colors[this.colorIndices[idx] % this.colors.length]
  }
}
