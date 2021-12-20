// The object animations are different with Three.js AnimationMixer
// They can integrare with engine control, dynamicly update animation params

class ObjectAnimation {

  constructor() {
    this.elapsed = 0
    this.isPlaying = true
  }

}

export class WaterBuoyancyAnimation extends ObjectAnimation {

  constructor(options) {
    super()

    this.options = {
      object: null,
      intensity: 1,
      ...options
    }

  }

  update(delta) {
    this.elapsed += delta

    const { intensity, object } = this.options

    object.position.y = object.position.y + Math.cos(this.elapsed) * 0.002 * intensity
    object.rotation.x = object.rotation.x + Math.cos(this.elapsed * 0.5) * 0.001 * intensity
    object.rotation.z = object.rotation.z + Math.sin(this.elapsed * 0.5) * 0.0001 * intensity
  }

}
