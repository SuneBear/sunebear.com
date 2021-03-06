import * as Tone from 'tone'

const SYNC_MODE = false

export default class Audio {

  constructor(audioPlayers = {}) {
    this.players = {}

    this.setupPlayers(audioPlayers)

    Tone.context.lookAhead = 0
    Tone.Transport.start()

    this.setupEvents()
  }

  setupEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pause()
      } else {
        this.resume()
      }
    })
  }

  setupPlayers(items) {
    this.players = {
      ...this.players,
      ...items
    }
  }

  get(name) {
    const player = this.players[name]

    if (!player) {
      return new Tone.Player()
    }

    return player
  }

  set(name, player) {
    this.players[name] = player

    return player
  }

  // @TODO:
  // - Support play post-loaded audio resource
  // - Support deck play an audio series?
  play(name, options = {}) {
    let player = this.players[name]

    if (!player) {
      console.warn(`Invaid player name: ${name}`)
      return
    }

    let start = Tone.Transport.seconds || player.now()

    options = {
      delay: 0,
      startAt: 0,
      ...player.assetOptions,
      ...options
    }
    const { delay, startAt, fadeIn, lock, loop, onPlay, chains, volume } = options

    if (typeof loop !== 'undefined') {
      player.loop = loop
    }

    if (typeof volume !== 'undefined') {
      player.volume.value = volume
    }

    if (typeof fadeIn !== 'undefined') {
      player.fadeIn = fadeIn
    }

    if (typeof lock !== 'undefined') {
      player.lock = lock
    }

    if (player.state !== 'stopped') {
      start += 0.001
    }

    if (player.lock && player.state !== 'stopped') {
      return player
    }

    if (chains && Array.isArray(chains)) {
      player.disconnect()
      player.chain(...chains, Tone.Destination)
    }

    if (onPlay) {
      onPlay(player)
    }

    try {
      player.start(start + delay, startAt)
    } catch (error) {
      console.log(`[Audio Manager] ${name} play`, error)
    }

    return player
  }

  pause() {
    this.lastSeconds = Tone.TransportTime().toSeconds()
    Tone.Transport.pause()
    if (!SYNC_MODE) {
      this.stopAll()
    }
  }

  // @FIXME: Seek player buffer to lastSeconds
  resume() {
    Tone.Transport.start()
  }

  mute() {
    Tone.Destination.mute = true
  }

  unmute() {
    Tone.Destination.mute = false
  }

  stop(name) {
    const player = this.players[name]

    if (!player) {
      console.warn(`Invaid player name: ${name}`)
      return
    }

    player.stop()
  }

  stopAll() {
    Object.keys(this.players).map(name => {
      const player = this.players[name]
      player.stop()
    })
  }

}
