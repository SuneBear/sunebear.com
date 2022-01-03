import * as THREE from 'three'

// Notice:
// - Unique name is required
// - add ".default" when require gltf and glb files
// @TODO: auto require files, catetory by load stages: preload, postload
// for improving loading speed, some resource need to be load in spec modules

const REPEAT_TEXTURE_OPTIONS = {
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping
}
const REPEAT_NO_MIPMAPS_TEXTURE_OPTIONS = {
  ...REPEAT_TEXTURE_OPTIONS,
  minFilter: THREE.LinearFilter,
  generateMipmaps: false
}

const LINEAR_TEXTURE_OPTIONS = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter
}

const NEAREST_TEXTURE_OPTIONS = {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter
}

const TRACE_AUDIO_OPTIONS = {
  lock: true,
  fadeIn: 1,
  fadeOut: 1,
  volumeDelta: -5,
  envelope: {
    attack: 0.2,
    sustain: 1,
    release: 0.5,
    decay: 0
  }
}

export default [
  {
    name: 'preload',
    data: {},
    items: [
      // Models
      {
        name: 'octopusModel',
        source: require('./objs/octopus.obj').default
      },
      { name: 'testModel', source: require('./gltfs/test.glb').default },
      {
        name: 'boidFishModel',
        source: require('./gltfs/boid-fish.glb').default
      },
      {
        name: 'buildingSnowfallSpaceModel',
        source: require('./gltfs/building-snowfall-space.glb').default
      },
      {
        name: 'buildingSuneBearHomeModel',
        source: require('./gltfs/building-sunebear-home.glb').default
      },
      {
        name: 'playerCharacterModel',
        source: require('./gltfs/player-character.glb').default
      },
      {
        name: 'playerBoatModel',
        source: require('./gltfs/player-boat.glb').default
      },
      {
        name: 'playerIceBearModel',
        source: require('./gltfs/player-ice-bear.glb').default
      },

      // Spritesheets
      {
        name: 'butterflyFlySpritesheet',
        source: require('./spritesheets/butterfly.png'),
        type: 'spritesheet',
        options: require('./spritesheets/butterfly.json')
      },
      // {
      //   name: 'stillGroundItemsSpritesheet',
      //   source: require('./spritesheets/still-ground-items.png'),
      //   type: 'spritesheet',
      //   options: require('./spritesheets/still-ground-items.json')
      // },
      {
        name: 'stillWaterItemsSpritesheet',
        source: require('./spritesheets/still-water-items.png'),
        type: 'spritesheet',
        options: require('./spritesheets/still-water-items.json')
      },

      // Textures
      {
        name: 'blueNoiseTexture',
        source: require('./textures/bluenoise-0.png'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'grainNoiseTexture',
        source: require('@/assets/cear-ui/mask-grain-noise.png'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'dispChapterTexture',
        source: require('./textures/disp1.jpg'),
        type: 'texture'
      },
      {
        name: 'fiveToneTexture',
        source: require('./textures/five-tone.jpg'),
        type: 'texture',
        options: NEAREST_TEXTURE_OPTIONS
      },
      {
        name: 'threeToneTexture',
        source: require('./textures/three-tone.jpg'),
        type: 'texture',
        options: NEAREST_TEXTURE_OPTIONS
      },
      {
        name: 'lutTexture',
        source: require('./textures/lut-grasslands.png'),
        type: 'texture',
        options: LINEAR_TEXTURE_OPTIONS
      },
      {
        name: 'testTexture',
        source: require('./textures/test.png'),
        type: 'texture'
      },
      {
        name: 'spriteMaskTexture',
        source: require('./textures/masks/f.png'),
        type: 'texture',
        options: REPEAT_NO_MIPMAPS_TEXTURE_OPTIONS
      },
      // {
      //   name: 'octopusBaseTexture',
      //   source: require('./textures/octopus-base.png'),
      //   type: 'texture'
      // },
      {
        name: 'softCircleTexture',
        source: require('./textures/soft-circle.png'),
        type: 'texture'
      },
      // {
      //   name: 'terrainHightmapTexture',
      //   source: r equire('./textures/terrain-hightmap.png'),
      //   type: 'texture'
      // },
      // {
      //   name: 'floorTexture',
      //   source: require('./textures/floor.jpg'),
      //   type: 'texture',
      //   options: REPEAT_TEXTURE_OPTIONS
      // },
      // {
      //   name: 'floorPathTexture',
      //   source: require('./textures/floor-path.jpg'),
      //   type: 'texture',
      //   options: REPEAT_TEXTURE_OPTIONS
      // },
      {
        name: 'floorOverlayTexture',
        source: require('./textures/floor-overlay.jpg'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'waterCausticsTexture',
        source: require('./textures/floor-overlay.jpg'),
        type: 'texture',
        options: REPEAT_TEXTURE_OPTIONS
      },
      {
        name: 'iceCausticsTexture',
        source: require('./textures/ice-caustics.jpg'),
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
        name: 'sunTokenTexture',
        source: require('./textures/tokens/sun.png'),
        type: 'texture'
      },
      {
        name: 'snowTokenTexture',
        source: require('./textures/tokens/snow.png'),
        type: 'texture'
      },

      // Audios
      { name: 'testAudio', source: require('./audios/test.mp3').default },
      {
        name: 'atmoRain',
        source: require('./audios/atmo-rain.mp3').default,
        options: { loop: true, lock: true, volumeDelta: -15, fadeIn: 1, fadeOut: 1 }
      },
      { name: 'waterTrace1', source: require('./audios/water-01.mp3').default, options: TRACE_AUDIO_OPTIONS },
      { name: 'waterTrace2', source: require('./audios/water-02.mp3').default, options: TRACE_AUDIO_OPTIONS },
      { name: 'iceTrace1', source: require('./audios/ice-01.mp3').default, options: TRACE_AUDIO_OPTIONS },
      { name: 'iceTrace2', source: require('./audios/ice-02.mp3').default, options: TRACE_AUDIO_OPTIONS },
      { name: 'iceTrace3', source: require('./audios/ice-03.mp3').default, options: TRACE_AUDIO_OPTIONS },
      { name: 'pin', source: require('./audios/pin.mp3').default }
    ]
  },
  {
    name: 'postload',
    items: []
  }
]
