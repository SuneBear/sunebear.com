import EventEmitter from './utils/event-emitter'

export default class Sizes extends EventEmitter {
  /**
   * Constructor
   */
  constructor(options = {}) {
    super()

    this.options = options

    // Viewport size
    this.viewport = {}
    this.$sizeViewport = document.createElement('div')
    this.$sizeViewport.style.width = '100vw'
    this.$sizeViewport.style.height = '100vh'
    this.$sizeViewport.style.position = 'absolute'
    this.$sizeViewport.style.top = 0
    this.$sizeViewport.style.left = 0
    this.$sizeViewport.style.pointerEvents = 'none'

    // Resize event
    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)

    this.resize()
  }

  /**
   * Resize
   */
  resize() {
    const { onResize } = this.options
    document.body.appendChild(this.$sizeViewport)
    this.viewport.width = this.$sizeViewport.offsetWidth
    this.viewport.height = this.$sizeViewport.offsetHeight
    document.body.removeChild(this.$sizeViewport)

    this.width = window.innerWidth
    this.height = window.innerHeight

    onResize && onResize()

    this.trigger('resize')
  }
}
