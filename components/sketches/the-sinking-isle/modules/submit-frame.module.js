import Module from './base'

export default class SubmitFrameModule extends Module {

  constructor(sketch) {
    super(sketch)

    this.frameTasks = []
    this.postRenderCallbacks = []
    this.preRenderCallbacks = []
  }

  // like $vm.$nextTick
  addFrameTask(cb) {
    this.frameTasks.push(cb)
  }

  nextFrameTask() {
    if (!this.frameTasks.length) return null
    return this.frameTasks.shift()
  }

  addPostRenderCallback(cb) {
    this.postRenderCallbacks.push(cb)
  }

  addPreRenderCallback(cb) {
    this.preRenderCallbacks.push(cb)
  }

  preRender() {
    this.preRenderCallbacks.map((fn) => fn())
  }

  postRender() {
    this.postRenderCallbacks.map((fn) => fn())
  }

}
