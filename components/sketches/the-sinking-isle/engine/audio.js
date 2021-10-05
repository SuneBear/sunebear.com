import * as Tone from 'tone'

export default class Audio {

  constructor(audioPlayers = {}) {
    this.players = {}

    this.setupPlayers(audioPlayers)
  }

  setupPlayers(items) {
    this.players = {
      ...this.players,
      ...items
    }
  }

  // @TODO:
  // - Support lock option, ignore duplicate play
  // - Support resume option and pause method
  play(name, options = {}) {
    const { offset, lock, loop } = options
    const player = this.players[name]
    let start = player.now()

    if (!player) {
      console.warn(`Invaid player name: ${name}`)
    }

    player.loop = loop

    if (player.state !== 'stopped') {
      start += 0.1
    }

    player.start(start, offset)
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
