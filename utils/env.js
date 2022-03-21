export const isMobile = (ua = process.client && navigator.userAgent) => {
  return /(Android|webOS|iPod|BlackBerry|Phone|playbook|silk|iOS|iPad|iPhone)/i.test(
    ua
  )
}

export const isWeChat = (ua = process.client && navigator.userAgent) => {
  return /(micromessenger|webbrowser)/.test(
    ua.toLocaleLowerCase()
  )
}

export const isSafari = (ua = (process.client && navigator.userAgent) || '') => {
  // Treat WeChat as Safari
  return /^((?!chrome|android).)*safari/i.test(ua) || isWeChat(ua)
}
