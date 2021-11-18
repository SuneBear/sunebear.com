export function getBasenameFromPath (path, stripExt = true) {
  let filename = path.split(/[\\/]/).pop()
  if (stripExt) {
    filename = filename.substr(0, filename.lastIndexOf('.'))
  }
  return filename
}

export function importContext(context) {
  return context.keys().map(key => ({
    name: getBasenameFromPath(key),
    src: context(key)
  }))
}
