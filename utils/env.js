export const isMobile = (ua = navigator.userAgent) => {
  return /(Android|webOS|iPod|BlackBerry|Phone|playbook|silk|iOS|iPad|iPhone)/i.test(
    ua
  )
}

export const isSafari = (ua = navigator.userAgent) => {
  return /^((?!chrome|android).)*safari/i.test(ua)
}
