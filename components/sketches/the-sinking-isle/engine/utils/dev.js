export const __DEBUG__ = process.env.NODE_ENV === 'development'

export const devLog = (...logs) => {
  if (!__DEBUG__) {
    return
  }

  console.log(...logs)
}
