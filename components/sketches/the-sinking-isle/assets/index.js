// Notice:
// - Unique name is required
// - add ".default" when require gltf and glb files
// @TODO: auto require files, catetory by load stages: preload, postload

export default [
  {
    name: 'visual',
    data: {},
    items:
    [
      { name: 'testTexture', source: require('./textures/test.png'), type: 'texture' },
      { name: 'testModel', source: require('./gltfs/test.glb').default },
    ]
  },
  {
    name: 'audio',
    items:
    [
      { name: 'testAudio', source: require('./audios/test.ogg').default },
      { name: 'pin', source: require('./audios/pin.mp3').default }
    ]
  }
]
