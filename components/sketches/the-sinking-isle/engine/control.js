import * as THREE from 'three'
import EventEmitter from './utils/event-emitter'
import { autobind } from './utils/decorators'

// Currently support keyboard, mouse, touch inputs
export default class Control extends EventEmitter {
  constructor($canvas) {
    super()

    if ($canvas === undefined) {
      console.error('Sketch Engine: The $canvas is undefined')
      return
    }

    this.$canvas = $canvas

    this.tapState = {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      multitouch: false,
      pressed: false,
      currentTouchId: null,
      hasTouchEvents: false
    }
    this.isEnablePress = true
    this.pressedKeys = {} // ASCII table
    // @TODO: Add can repeat method with pressedKeys
    this.isKeyRepeat = true
    this.isEnableTap = true
    this.needPressdMove = true

    // this.handleKeydown = this.handleKeydown.bind(this)
    // this.handleKeyup = this.handleKeyup.bind(this)
    // this.handleMousemove = this.handleMousemove.bind(this)
    // this.handleMousedown = this.handleMousedown.bind(this)
    // this.handleMouseup = this.handleMouseup.bind(this)
    // this.handleContextmenu = this.handleContextmenu.bind(this)
    // this.handleTouchstart = this.handleTouchstart.bind(this)
    // this.handleTouchmove = this.handleTouchmove.bind(this)
    // this.handleTouchend = this.handleTouchend.bind(this)
    // this.handleTap = this.handleTap.bind(this)

    this.listenEvents()
  }

  listenEvents() {
    const eventOptions = {
      passive: true
    }

    // Keyboard
    window.addEventListener('keydown', this.handleKeydown, eventOptions)
    window.addEventListener('keyup', this.handleKeyup, eventOptions)

    // Move and single event
    this.$canvas.addEventListener('mousedown', this.handleMousedown)
    document.body.addEventListener(
      'mousemove',
      this.handleMousemove,
      eventOptions
    )
    window.addEventListener('mouseup', this.handleMouseup, eventOptions)
    this.$canvas.addEventListener(
      'contextmenu',
      this.handleContextmenu,
      eventOptions
    )
    this.$canvas.addEventListener('touchstart', this.handleTouchstart, {
      passive: false
    })
    window.addEventListener('touchend', this.handleTouchend, eventOptions)
    window.addEventListener('touchmove', this.handleTouchmove)

    // Tap
    // window.addEventListener("touchend", this.handleTap, eventOptions)
    window.addEventListener('click', this.handleTap, eventOptions)
    // this.$canvas.addEventListener("mousedown", this.handleTap, eventOptions)
  }

  isPressed(key = 'tap') {
    if (key === 'tap') {
      return this.tapState.pressed
    }

    key = typeof key === 'string' ? this.keymap(key) : key

    return this.pressedKeys[key]
  }

  getMouse() {
    return new THREE.Vector2(
      this.tapState.x,
      this.tapState.y
    )
  }

  shouldIgnoreTap(e) {
    // Only enable left mouse
    if (e.button !== 0) {
      return
    }
    return !this.isEnableTap
  }

  // Keymap - keyCode <=> keyName
  keymap = (() => {
    // Incomplete keyCodes map
    const keyCodesMap = {
      8: 'delete',
      9: 'tab',
      13: 'enter',
      16: 'shift',
      17: 'ctrl',
      18: 'alt',
      20: 'capsLock',
      27: 'escape',
      32: 'spacebar',
      37: 'leftArrow',
      38: 'upArrow',
      39: 'rightArrow',
      40: 'downArrow',
      46: 'delete',
      91: 'command',
      93: 'contextMenu',

      // Punctuations keys in US layout
      186: 'semicolon',
      187: 'equal',
      188: 'comma',
      189: 'minus',
      190: 'period',
      192: 'backquote',
      219: 'bracketLeft',
      220: 'backslash',
      221: 'bracketRight',
      222: 'quote'
    }

    // Append numbers
    for (let i = 48; i < 58; i++) keyCodesMap[i] = i - 48

    // Append low case alphabets
    for (let i = 97; i < 123; i++) keyCodesMap[i - 32] = String.fromCharCode(i)

    // Append function keys
    for (let i = 1; i < 13; i++) keyCodesMap[i + 111] = 'f' + i

    const swappedKeyCodesMap = Object.keys(keyCodesMap).reduce((obj, key) => {
      obj[keyCodesMap[key]] = parseInt(key)
      return obj
    }, {})

    return arg =>
      typeof arg === 'number' ? keyCodesMap[arg] : swappedKeyCodesMap[arg]
  })()

  processTapEvent(e) {
    this.tapState.clientX = e.clientX
    this.tapState.clientY = e.clientY
    this.tapState.x = (e.clientX / this.$canvas.clientWidth) * 2 - 1
    this.tapState.y = -(e.clientY / this.$canvas.clientHeight) * 2 + 1
    return this.tapState
  }

  @autobind
  handleKeydown(e) {
    const keyCode = e.keyCode

    if (!this.isKeyRepeat && this.isPressed(keyCode)) return
    this.pressedKeys[keyCode] = true

    for (let key in this.pressedKeys) {
      if (!this.pressedKeys[key]) continue
      this.trigger('keydown', [this.keymap(keyCode)])
    }
  }

  @autobind
  handleKeyup(e) {
    const keyCode = e.keyCode
    this.pressedKeys[keyCode] = false
    this.trigger('keyup', [this.keymap(keyCode)])
  }

  @autobind
  handleMousedown(e) {
    if (this.shouldIgnoreTap(e)) {
      return
    }
    this.tapState.pressed = true
    this.processTapEvent(e)
    this.trigger('mousedown', [this.tapState])
    this.trigger('tapdown', [this.tapState])
  }

  @autobind
  handleMousemove(e) {
    if (this.shouldIgnoreTap(e)) {
      return
    }
    if (this.needPressdMove && !this.tapState.pressed) {
      return
    }
    this.processTapEvent(e)
    this.trigger('mousemove', [this.tapState])
  }

  @autobind
  handleMouseup(e) {
    if (this.shouldIgnoreTap(e)) {
      return
    }
    this.tapState.pressed = false
    this.processTapEvent(e)
    this.trigger('mouseup', [this.tapState])
    this.trigger('tapup', [this.tapState])
  }

  @autobind
  handleContextmenu(e) {
    if (process.env.NODE_ENV !== 'development') {
      e.preventDefault()
      return false
    }
  }

  @autobind
  handleTouchstart(e) {
    this.tapState.hasTouchEvents = true

    if (this.shouldIgnoreTap(e)) {
      return
    }

    let touch
    if (this.tapState.currentTouchId == null) {
      // no ID yet assigned
      touch = e.changedTouches[0]
      this.tapState.currentTouchId = touch.identifier
      // trigger event start
      e.preventDefault()
      this.processTapEvent(touch)
      this.tapState.pressed = true
    }
    this.tapState.multitouch = e.touches.length > 1
    this.trigger('touchstart', [this.tapState])
    this.trigger('tapdown', [this.tapState])
  }

  @autobind
  handleTouchmove(e) {
    if (this.shouldIgnoreTap(e)) {
      return
    }

    if (this.tapState.currentTouchId === null) {
      // odd case here, we have no touch registered, find the first one...
      this.tapState.currentTouchId = e.changedTouches[0].identifier
    }
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]
      if (t.identifier === this.tapState.currentTouchId) {
        this.tapState.pressed = true
        this.processTapEvent(t)
        break
      }
    }
    this.tapState.multitouch = e.touches.length > 1
    this.trigger('touchmove', [this.tapState])
  }

  @autobind
  handleTouchend(e) {
    if (this.shouldIgnoreTap(e)) {
      return
    }

    const prevId = this.tapState.currentTouchId

    // now see if the changed touch matches our ID
    if (this.tapState.currentTouchId !== null) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        if (t.identifier === this.tapState.currentTouchId) {
          this.tapState.currentTouchId = null
          this.processTapEvent(t)
          break
        }
      }
    }

    // we've lost our touch, see if there's another one we should pick up
    if (!this.tapState.currentTouchId) {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i]
        if (t.identifier !== prevId) {
          this.tapState.currentTouchId = t.identifier
          this.tapState.pressed = true
          this.processTapEvent(t)
          break
        }
      }
    }

    // still none... just take first
    if (!this.tapState.currentTouchId && e.touches.length >= 1) {
      const t = e.touches[0]
      this.tapState.currentTouchId = t.identifier
      this.tapState.pressed = true
      this.processTapEvent(t)
    }

    if (!this.tapState.currentTouchId) {
      this.tapState.pressed = false
    }

    this.tapState.multitouch = e.touches.length > 1
    this.trigger('touchend', [this.tapState])
    this.trigger('tapup', [this.tapState])
  }

  // Using tap to combine mouse and touch
  @autobind
  handleTap(e) {
    this.trigger('tap', [e])
  }

  clearPress() {
    this.tapState.pressed = false
    for (let key in this.pressedKeys) {
      this.pressedKeys[key] = false
    }
  }

  destory() {
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
    document.body.removeEventListener('mousemove', this.handleMousemove)
    this.$canvas.removeEventListener('mousedown', this.handleMousedown)
    this.$canvas.removeEventListener('mouseup', this.handleMouseup)
    this.$canvas.removeEventListener('contextmenu', this.handleContextmenu)
    this.$canvas.removeEventListener('touchstart', this.handleTouchstart)
    window.removeEventListener('touchend', this.handleTouchend)
    window.removeEventListener('touchmove', this.handleTouchmove)
    window.removeEventListener('click', this.handleTap)
  }
}
