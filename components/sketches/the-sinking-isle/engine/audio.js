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
    let start = Tone.Transport.seconds || player.now()

    if (!player) {
      console.warn(`Invaid player name: ${name}`)
    }

    options = {
      ...player.defaultOptions,
      ...options
    }
    const { delay, fadeInDuration, lock, loop } = options

    player.loop = loop

    if (fadeInDuration) {
      player.fadeIn = fadeInDuration
    }

    if (player.state !== 'stopped') {
      start += 0.001
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
