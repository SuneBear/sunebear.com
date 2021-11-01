import { Color } from '~/components/sketches/the-sinking-isle/engine/utils'
export { Color } from '~/components/sketches/the-sinking-isle/engine/utils'

export function cssVar(name, value) {
  name = name.replace(/var\((.*?)\)/, '$1')
  if (name[0] != '-') name = '--' + name // allow passing with or without --
  if (value) {
    const color = Color(value).object()
    document.documentElement.style.setProperty(name, value)
    document.documentElement.style.setProperty(`${name}-rgb`, `${color.r}, ${color.g}, ${color.b}`)
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}


