import * as eases from "eases"

// Get playhead in 0..1 range via elapsed and duration in seconds
export function getEasePlayhead(params = {}, duration, delay, endTime, ease) {
  if (typeof params === 'number') {
    params = {
      elapsed: params,
      duration,
      delay,
      endTime,
      ease
    }
  }

  const elapsed = params.elapsed || 0
  delay = params.delay || 0
  endTime = params.endTime || Infinity
  duration = 0.25
  ease = params.ease || eases.sineInOut

  const time = Math.max(0, elapsed - delay)

  let playhead = 0

  if (time <= duration) {
    playhead = time / duration
  } else if (isFinite(endTime) && time >= endTime - duration) {
    // Reverse playhead
    const el = Math.max(0, time - (endTime - duration))
    const t = el / duration
    playhead = Math.max(0, 1 - t)
  } else {
    playhead = 1
  }

  playhead = typeof ease === 'string' ? eases[ease](t) : ease(playhead)

  return playhead
}
