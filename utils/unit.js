export function parseUnit(str, out) {
  if (!out)
    out = [ 0, 'px' ]
  str = String(str)
  var num = parseFloat(str, 10)
  out[0] = num
  out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || out[1]
  return out
}
