export const isMobile = (ua = navigator.userAgent) => {
  return /(Android|webOS|iPod|BlackBerry|Phone|playbook|silk|iOS|iPad|iPhone)/i.test(
    ua
  )
}
