import { random, math } from '../engine/utils'

// The object animations are different with Three.js AnimationMixer
// They can integrare with engine control, dynamicly update animation params

class ObjectAnimation {

  constructor() {
    this.elapsed = random.range(0, Math.PI)
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
    // object.position.x = object.position.x + Math.cos(this.elapsed) * 0.1 * intensity
    object.rotation.x = object.rotation.x + Math.cos(this.elapsed * 0.5) * 0.0001 * intensity
    object.rotation.z = object.rotation.z + Math.sin(this.elapsed * 0.5) * 0.0001 * intensity
  }

}


export class BloomPulseAnimation extends ObjectAnimation {

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

    // @FIXME: Let shaderMaterial support emissiveIntensity param via color.offsetHSL
    if (object.userData.type === 'meshSprite') {
      let value = object.material.uniforms.animateProgress.value
      value += Math.sin(this.elapsed) * 0.01 * intensity
      object.material.uniforms.animateProgress.value = math.clamp(value, 0.6, 0.9)
    } else {
      object.material.emissiveIntensity += Math.sin(this.elapsed) * 0.01 * intensity
    }
  }

}

