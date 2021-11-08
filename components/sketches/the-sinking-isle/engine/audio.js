import * as Tone from 'tone'

export default class Audio {

  constructor(audioPlayers = {}) {
    this.players = {}

    this.setupPlayers(audioPlayers)

    Tone.context.lookAhead = 0
    Tone.Transport.start()
  }

  setupPlayers(items) {
    this.players = {
      ...this.players,
      ...items
    }
  }

  // @TODO:
  // - Support lock option, ignore duplicate play
  // - Config audio options in assets map, store default audio options in players
  play(name, options = {}) {
    const player = this.players[name]

    if (!player) {
      console.warn(`Invaid player name: ${name}`)
      return
    }

    let start = Tone.Transport.seconds || player.now()

    options = {
      ...player.defaultOptions,
      ...options
    }
    const { delay, fadeIn, lock, loop } = options

    if (typeof loop !== 'undefined') {
      player.loop = loop
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
      return
    }

    player.start(start, delay)
  }

  pause() {
    Tone.Transport.pause()
  }

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
