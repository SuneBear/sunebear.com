export const copyToClipboard = (text) => {
  const aux = document.createElement('input')
  aux.setAttribute('value', name)
  document.body.appendChild(aux)
  aux.select()
  document.execCommand('copy')
  document.body.removeChild(aux)
}
