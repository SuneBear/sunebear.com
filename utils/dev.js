export let __DEBUG__ = process.env.NODE_ENV === 'development'

export const debugCreator = (
  namespace,
  isOpen = true
) => (...messages) => {
  if (!__DEBUG__ || !isOpen) {
    return
  }
  console.log(`${namespace}:`, ...messages)
}

export const devLog = debugCreator('Default')

if (process.client) {
  if (location.search.includes('debug')) {
    __DEBUG__ = true
  } else if (location.search.includes('production')) {
    __DEBUG__ = false
  }
}
