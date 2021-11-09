export let __DEBUG__ = process.env.NODE_ENV === 'development'

if (process.client) {
  if (location.search.includes('debug')) {
    __DEBUG__ = true
  } else if (location.search.includes('production')) {
    __DEBUG__ = false
  }
}
