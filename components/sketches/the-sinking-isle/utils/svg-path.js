import parseSVG from 'parse-svg-path'
import getContours from 'svg-path-contours'
import simplify from 'simplify-path'
import normalizePathScale from 'normalize-path-scale'

export function getPathFromSVG(svgData) {
  const contours = getContours(parseSVG(svgData), 1)
  let path = normalizePathScale(contours[0])
  path = simplify(path, 0.01)
  return path
}
