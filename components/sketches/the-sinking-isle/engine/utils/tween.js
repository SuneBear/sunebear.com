import * as eases from "eases"

// Get playhead in 0..1 range via elapsed and duration in seconds
export function getEasePlayhead(params = {}, animateDuration, duration, delay, endTime, ease) {
  if (typeof params === 'number') {
    params = {
      // elapsed === time
      elapsed: params,
      time,

      animateDuration,

      // duration === endTime
      duration,
      endTime,

      delay,
      ease
    }
  }

  const elapsed = params.elapsed || params.time || 0
  animateDuration = params.animateDuration || 0.25
  delay = params.delay || 0
  endTime = params.endTime || params.duration || Infinity
  ease = params.ease || eases.sineInOut

  const time = Math.max(0, elapsed - delay)

  let playhead = 0

  if (time <= animateDuration) {
    playhead = time / animateDuration
  } else if (isFinite(endTime) && time >= endTime - animateDuration) {
    // Reverse playhead
    const el = Math.max(0, time - (endTime - animateDuration))
    const t = el / animateDuration
    playhead = Math.max(0, 1 - t)
  } else {
    playhead = 1
  }

  playhead = typeof ease === 'string' ? eases[ease](t) : ease(playhead)

  return playhead
}
