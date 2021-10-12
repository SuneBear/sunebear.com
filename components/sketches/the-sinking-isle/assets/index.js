// Notice:
// - Unique name is required
// - add ".default" when require gltf and glb files
// @TODO: auto require files, catetory by load stages: preload, postload

export default [
  {
    name: 'preload',
    data: {},
    items:
    [
      // Texture
      { name: 'testTexture', source: require('./textures/test.png'), type: 'texture' },

      // Model
      { name: 'testModel', source: require('./gltfs/test.glb').default },

      // Audio
      { name: 'testAudio', source: require('./audios/test.ogg').default },
      { name: 'pin', source: require('./audios/pin.mp3').default }
    ]
  },
  {
    name: 'postload',
    items:
    [

    ]
  }
]
