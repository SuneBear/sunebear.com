export const noteToMidiMap = {}
export const midiToNoteMap = {}

const init = () => {
  const A0 = 0x15 // First note
  const C8 = 0x6C // Last note
  const pitchNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  for (let n = A0; n <= C8; n++) {
    const octave = (n - 12) / 12 >> 0
    const name = pitchNames[n % 12] + octave
    noteToMidiMap[name] = n
    midiToNoteMap[n] = name
  }
}

init()

export const FULL_PITCH_RANGE = Object.keys(noteToMidiMap)

export const generateMidiPartNoteEvents = (midiJSON) => {
  const events = []
  midiJSON.tracks.map((track) => {
    events.push(...track.notes)
  })
  return events
}
