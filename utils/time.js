export function getFormattedDate(time) {
  const date = typeof time === 'object' ? time : new Date(time)
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  if (month < 10) {
    month = '0' + month
  }

  if (day < 10) {
    day = '0' + day
  }

  return `${year}-${month}-${day}`
}
