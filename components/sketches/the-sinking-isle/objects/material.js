import * as THREE from 'three'

export const commonShaderUniforms = {

  time: {
    value: 0
  },

  resolution: {
    value: new THREE.Vector2(0, 0)
  },

  envTraceMap: {
    value: new THREE.Texture()
  }

}
