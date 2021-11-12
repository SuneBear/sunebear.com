import * as THREE from 'three'
import { shareAtlasTexture } from './three-util'

// @TOOD: Support dom target
export function parseSpritesheets({ sheets, renderer, target = 'three' }) {
  let atlases

  if (!Array.isArray(sheets)) {
    sheets = [sheets]
  }

  atlases = sheets.map(({ image }) => {
    const texture = new THREE.Texture()
    texture.image = image
    texture.needsUpdate = true
    if (renderer) {
      renderer.initTexture(texture)
    }
    return texture
  })

  const spritesMap = {}
  sheets.map((data, sheetIndex) => {
    const imageName = data.meta.image.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '')
    data.frames.map((item, itemIndex) => {
      const frame = item.frame
      const file = `${imageName}/${item.filename}`
      const texture = new THREE.Texture()
      const spriteTextureSize = data.meta.size
      const { w, h } = spriteTextureSize
      texture.minFilter = THREE.LinearFilter
      texture.repeat.set(frame.w / w, frame.h / h)
      texture.offset.x = frame.x / w
      texture.offset.y = 1 - frame.h / h - frame.y / h
      let type = ''
      const id = file.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '')
      let basename = id
      const slashIdx = id.lastIndexOf('/')
      if (slashIdx >= 0) {
        type = id.substring(0, slashIdx).toLowerCase()
        basename = id.substring(slashIdx + 1)
      }
      const atlas = atlases[sheetIndex]
      shareAtlasTexture(renderer, atlas, texture)
      const frameNumMatch = id.match(/(^|[^\d])(\d+)$/)
      let idCount = itemIndex
      if (frameNumMatch) {
        idCount = parseInt(frameNumMatch[2], 10)
      }
      const spriteItem = {
        atlas,
        sheetIndex,
        name: id,
        basename,
        data: frame,
        width: frame.w,
        height: frame.h,
        offset: texture.offset.clone(),
        repeat: texture.repeat.clone(),
        texture,
        type,
        idCount
      }
      spritesMap[id] = spriteItem
    })
  })

  const values = Object.values(spritesMap)
  const frames = values.slice().sort((a, b) => {
    return a.idCount - b.idCount
  })

  return {
    atlases,
    spritesMap,
    frames
  }
}
