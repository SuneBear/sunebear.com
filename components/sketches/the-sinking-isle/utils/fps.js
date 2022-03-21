// @REF: https://github.com/lukeed/rafps
// @FIXME: lockFPS will cause dropped frames
export function rafps(draw, fps, lockFPS = false) {
  const delay = 1e3 / (fps || 60)
  let tmp,
    pid,
    delta,
    last,
    lastTime,
    frame = -1

  function loop(time) {
    if (!last){
      last = time
      lastTime = time
    }
    delta = time - lastTime
    tmp = ((time - last) / delay) | 0
    if (pid && (!lockFPS || tmp > frame)) {
      draw(delta / 1000, (frame = tmp))
      lastTime = time
    }
    if (pid) pid = requestAnimationFrame(loop)
  }

  return {
    play: function() {
      if (!pid) pid = requestAnimationFrame(loop)
    },
    pause: function() {
      if (pid) {
        last = pid = cancelAnimationFrame(pid)
        frame = -1
      }
    }
  }
}
