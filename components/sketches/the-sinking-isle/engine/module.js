export default class Module {

  constructor(sketch, attributes) {
    this.sketch = sketch

    this.debug = this.sketch.debug
    this.config = this.sketch.config

    this.scene = this.sketch.scene
    this.camera = this.sketch.camera
    this.renderer = this.sketch.renderer

    this.asset = this.sketch.asset
    this.time = this.sketch.time
    this.sizes = this.sketch.sizes

    this.container = this.sketch.container
    this.$vm = this.sketch.$vm

    this.random = this.sketch.random

    this.enabled = true
    this.priority = 0

    if (attributes && attributes.priority) {
      this.priority = attributes.priority
    }
  }

  stop() {
    this.enabled = false
  }

  play() {
    this.enabled = true
  }

  resize() {

  }

  update(delta, elapsedTime) {

  }

}

Module.isModule = true

export class ModuleManager {

  constructor(sketch) {
    this.sketch = sketch
    this.modules = []
  }

  sortModules() {
    this.modules.sort((a, b) => {
      return a.priority - b.priority || a.order - b.order
    })
  }

  get(Module) {
    return this.modules.find((s) => s instanceof Module)
  }

  add(Module, attributes) {
    if (!Module.isModule) {
      throw new Error(
        `Module '${Module.name}' does not extend 'Module' class`
      )
    }

    if (this.get(Module) !== undefined) {
      console.warn(`Module '${Module.name}' already registered.`)
      return
    }

    const module = new Module(this.sketch, attributes)
    module.order = this.modules.length
    this.modules.push(module)
    this.sortModules()

    return module
  }

  remove(Module) {
    const module = this.getModule(Module)

    if (module === undefined) {
      console.warn(
        `Can unregister module '${Module.name}'. It doesn't exist.`
      )
      return
    }

    this.modules.splice(this.modules.indexOf(module), 1)
  }

  play() {
    this.modules.map((module) => module.play())
  }

  stop() {
    this.modules.map((module) => module.stop())
  }

  resize() {
    this.modules.map((module) => module.resize())
  }

  update(delta, elaspedTime) {
    this.modules.map((module) => {
      if (module.enabled) {
        module.update(delta, elaspedTime)
      }
    })
  }

  // @TODO: Add destory method if necessary

}
