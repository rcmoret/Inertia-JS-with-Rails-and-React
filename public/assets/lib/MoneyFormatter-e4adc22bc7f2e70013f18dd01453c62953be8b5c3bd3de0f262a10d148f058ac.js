const MoneyFormatter = (number, opts = { absolute: false, toFloat: false, decorate: false }) => {
  if (number === null || number === '') {
    return ""
  } else if (opts.toFloat) {
    const num = opts.absolute ? Math.abs(number) : number
    return parseFloat(num / 100.0).toFixed(2)
  } else if (opts.decorate) {
    const num = opts.absolute ? Math.abs(number) : number
    return "$" + (num / 100.0).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  } else {
    const num = opts.absolute ? Math.abs(number) : number
    return (num / 100.0).toFixed(2)
  }
}

export const decimalToInt = (amount) => {
  const stringArray = `${amount.replace(/[^-0-9.]/g, '')}.`.split(".")
  const dollars = stringArray[0]
  const cents = stringArray[1]

  if (cents.length == 0 && dollars === '-') {
    return 0
  } else if (cents.length == 0) {
    return parseInt(amount * 100)
  } else if (cents.length == 2) {
    return parseInt(`${dollars}${cents}`)
  } else if (cents.length == 1) {
    return parseInt(`${dollars}${cents}0`)
  } else {
    throw new Error(`malformatted number string: ${amount}`)
  }
  // return Math.round(parseFloat(amount) * 100)
}

export default MoneyFormatter;
