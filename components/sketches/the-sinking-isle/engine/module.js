import * as THREE from 'three'

// @TODO:
// - Do more in lifecycles, like register/remove data, events, animations
// - Freeze common managers, can use Object.defineProperty
export default class Module {

  constructor(attributes) {
    // States
    this.enabled = true
    this.priority = 0

    if (attributes && attributes.priority) {
      this.priority = attributes.priority
    }
  }

  play() {
    this.enabled = true
  }

  pause() {
    this.enabled = false
  }

  stop() {
    this.pause()
    if (this.instance) {
      this.scene.remove(this.instance)
    }
    this.audio.stopAll()
    // @TODO: Stop all running animations
  }

  resize() {}

  update(delta, elapsed, timestamp) {}
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
    const module = this.get(Module)

    if (module === undefined) {
      console.warn(
        `Can unregister module '${Module.name}'. It doesn't exist.`
      )
      return
    }

    module.stop()
    this.modules.splice(this.modules.indexOf(module), 1)
  }

  play() {
    this.modules.map((module) => module.play())
  }

  pause() {
    this.modules.map((module) => module.pause())
  }

  stop() {
    this.modules.map((module) => module.stop())
  }

  resize() {
    this.modules.map((module) => module.resize())
  }

  set(object) {
    this.modules.map((module) => {
      Object.assign(module, object)
    })
  }

  update(delta, elapsed, timestamp) {
    this.modules.map((module) => {
      if (module.enabled) {
        module.update(delta, elapsed, timestamp)
      }
    })
  }

  // @TODO: Add destory method if necessary
  destroy() {
    this.modules.map((module) => {
      this.remove(module)
    })
  }
}
