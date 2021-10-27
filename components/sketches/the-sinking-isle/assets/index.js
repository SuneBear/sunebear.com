import * as THREE from 'three'

// Notice:
// - Unique name is required
// - add ".default" when require gltf and glb files
// @TODO: auto require files, catetory by load stages: preload, postload

const REPEAT_TEXTURE_OPTIONS = {
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping
}

export default [
  {
    name: 'preload',
    data: {},
    items: [
      // Models
      {
        name: 'octopusModel',
        source: require('./objs/octopus.obj').default,
      },
      { name: 'testModel', source: require('./gltfs/test.glb').default },

      // Texture
      {
        name: 'testTexture',
        source: require('./textures/test.png'),
        type: 'texture'
      },
      {
        name: 'octopusBaseTexture',
        source: require('./textures/octopus-base.png'),
        type: 'texture'
      },
      {
        name: 'softCircleTexture',
        source: require('./textures/soft-circle.png'),
        type: 'texture'
      },
      {
        name: 'waterNoiseTexture',
        source: require('./textures/water-noise.png'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'waterDistortTexture',
        source: require('./textures/water-distort.png'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'waterDistortTexture',
        source: require('./textures/water-distort.png'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },

      // Audio
      { name: 'testAudio', source: require('./audios/test.ogg').default },
      { name: 'pin', source: require('./audios/pin.mp3').default }
    ]
  },
  {
    name: 'postload',
    items: []
  }
]
