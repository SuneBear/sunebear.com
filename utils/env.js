export const isMobile = (ua = process.client && navigator.userAgent) => {
  return /(Android|webOS|iPod|BlackBerry|Phone|playbook|silk|iOS|iPad|iPhone)/i.test(
    ua
  )
}

export const isSafari = (ua = process.client && navigator.userAgent) => {
  return /^((?!chrome|android).)*safari/i.test(ua)
}
