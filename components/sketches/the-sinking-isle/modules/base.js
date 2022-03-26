// @Dev: Import this for IntelliSense
import { theSinkingIsleSketch } from '../sketch'
import Module from '../engine/module'

export default class BaseModule extends Module {

  constructor(sketch = theSinkingIsleSketch, attributes) {
    super(attributes)

    // Common managers or modules
    this.sketch = sketch
    this.debug = sketch.debug
    this.stats = sketch.stats
    this.config = sketch.config

    this.control = sketch.control
    this.audio = sketch.audio
    this.asset = sketch.asset
    this.time = sketch.time
    this.sizes = sketch.sizes

    this.scene = sketch.scene
    this.camera = sketch.camera
    this.renderer = sketch.renderer
    this.domRenderer = sketch.domRenderer
    this.tween = sketch.tween
    this.submitFrame = sketch.submitFrame
    this.player = sketch.player
    this.enviromentGround = sketch.enviromentGround
    this.enviromentTrace = sketch.enviromentTrace
    this.enviroment = sketch.enviroment

    this.container = sketch.container
    this.$vm = sketch.$vm

    this.random = sketch.random
  }

}
