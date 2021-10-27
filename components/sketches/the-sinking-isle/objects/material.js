import * as THREE from 'three'

export const commonShaderUniforms = {

  time: {
    value: 0
  },

  walkDataMap: {
    value: new THREE.Texture()
  }

}
