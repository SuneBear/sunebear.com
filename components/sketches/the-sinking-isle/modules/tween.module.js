import anime from 'animejs'
import Module from '../engine/module'
import { math, getEasePlayhead } from '../engine/utils'

let tweenerUid = 0
let animerUid = 0
const TWEENER_KEY = 'tweener'
const ANIMER_KEY = 'animer'

export default class Tween extends Module {

  constructor(sketch) {
    super(sketch)

    this.tweenerMap = {}
    this.animerMap = {}
  }

  add(options = {}) {
    let tweener

    options = Object.assign({
      target: null,

      // Status
      elapsed: 0,
      isPlaying: true,
      hasFinished: false,

      // Tween Options
      duration: 0.25,
      delay: 0,
      lock: true,
      // @REF: https://animejs.com/documentation/#pennerFunctions
      easing: 'linear',
      autoPlay: false,
      killWhenFinished: true
    }, options)

    const target = options.target
    tweener = this._get(target)

    if (target && typeof target !== 'object') {
      console.warn(`Only support object as target ${target}`)
    }

    if (tweener && options.lock) {
      console.warn(`Only support one tween with {lock:true} for ${target}`)
      return
    }

    if (tweener) {
      // @TODO: Support multiple animers in one tweener
    } else {
      tweener = this._createTweener(options)
    }

    return tweener
  }

  _createTweener(options) {
    if (!options.id) {
      options._uid = `${TWEENER_KEY}${tweenerUid}`
      tweenerUid++
    } else {
      options._uid = options.id
    }

    const tweener = {
      ...options,
      isTweener: true
    }
    tweener.target[TWEENER_KEY] = tweener
    this._createAnimer(tweener, options)
    this.tweenerMap[options._uid] = tweener

    return tweener
  }

  _createAnimer(tweener, options) {
    if (!tweener._animerUids) {
      tweener._animerUids = []
    }
    const uid = `${ANIMER_KEY}${animerUid}`
    animerUid++
    const animer = anime({
      ...options,
      targets: [ options.target ],
      // Convert seconds to milesconds
      delay: options.delay * 1000,
      duration: options.duration * 1000
    })
    animer._uid = uid
    this.animerMap[uid] = animer

    tweener._animerUids.push(uid)
  }

  play(target) {
    const tweener = this.get(target)
    if (!tweener) {
      return
    }
    tweener.isPlaying = true
    tweener.hasFinished = false
  }

  stop(target) {
    const tweener = this.get(target)
    if (!tweener) {
      return
    }
    tweener.elapsed = 0
    tweener._animerIds.map(id => this.animerMap[id])
    tweener.isPlaying = false
  }

  _remove(target) {
    const tweener = this._get(target)

    if (!tweener) {
      null
    }

    tweener._animerUids.map(id => {
      const animer = this.animerMap[id]
      animer.pause()
      this.animerMap[id] = null
    })

    tweener.target.tweener = null
    delete this.tweenerMap[tweener._uid]
  }

  set(options) {
    const tweener = this.get(options)
    Object.assign(tweener, options, { hasFinished: false })
    this._setAnimer(tweener, tweener)
  }

  _setAnimer(tweener, options) {
    let lastAnimer
    if (tweener._animerUids.length) {
      const firstUid = tweener._animerUids.shift()
      lastAnimer = this.animerMap[firstUid]
      if (lastAnimer) {
        lastAnimer.pause()
      }
      this.animerMap[firstUid] = null
      tweener._animerUids
    }

    this._createAnimer(tweener, options)
  }

  _get(idOrTarget) {
    let tweener

    if (typeof idOrTarget === 'string') {
      tweener = this.tweenerMap[idOrTarget]
    } else if (idOrTarget && typeof idOrTarget === 'object') {
      if (idOrTarget.target) {
        idOrTarget = idOrTarget.target
      }
      tweener = idOrTarget[TWEENER_KEY]
    }

    return tweener
  }

  get(target) {
    const tweener = this._get(target)

    if (!tweener) {
      console.warn(`Invaid tween target: ${target}`)
    }

    return tweener
  }

  update(delta) {
    Object.keys(this.tweenerMap).map(key => {
      const tweener = this.tweenerMap[key]
      const playhead = getEasePlayhead({
        elapsed: tweener.elapsed,
        ease: 'linear',
        animateDuration: tweener.duration,
        delay: tweener.delay
      })

      if (!tweener.isPlaying) {
        return
      }

      tweener.elapsed += delta

      tweener._animerUids.map(id => {
        const animer = this.animerMap[id]
        animer.seek(playhead * animer.duration)
      })

      if (playhead >= 1) {
        tweener.hasFinished = true
      }

      if (tweener.hasFinished && tweener.killWhenFinished) {
        this._remove(tweener)
      }
    })
  }

  destroy() {
    Object.keys(this.tweenerMap).map(key => {
      const tweener = this.tweenerMap[key]
      this._remove(tweener)
    })

    this.tweenerMap = {}
    this.animerMap = {}
  }

}
