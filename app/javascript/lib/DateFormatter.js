const MonthDictionary = (mo) => {
  switch(parseInt(mo)) {
  case 1:
    return { short: "Jan.", long: "January" }
  case 2:
    return { short: "Feb.", long: "February" }
  case 3:
    return { short: "Mar.", long: "March" }
  case 4:
    return { short: "Apr.", long: "April" }
  case 5:
    return { short: "May", long: "May" }
  case 6:
    return { short: "June", long: "June" }
  case 7:
    return { short: "July", long: "July" }
  case 8:
    return { short: "Aug.", long: "August" }
  case 9:
    return { short: "Sep.", long: "September" }
  case 10:
    return { short: "Oct.", long: "October" }
  case 11:
    return { short: "Nov.", long: "November" }
  case 12:
    return { short: "Dec.", long: "December" }
  default:
    return { short: "", long: "" }
  }
}

export const formatted = (args) => {
  const { month, day, year, format } = args
  const monthString = MonthDictionary(month)
  const timeArgs = { hours: 0, minutes: 0, seconds: 0, ...args }
  const { hours, minutes, seconds } = timeArgs

  switch(format) {
  case "dateObject":
    return new Date(year, (month - 1), day, hours, minutes, seconds)
  case "longMonth":
    return monthString.long
  case "m/d":
    return `${month}/${day}`
  case "m/d/yy":
    return `${month}/${day}/${year.toString().slice(-2)}`
  case "mm/dd/yyyy":
    return [(month < 10 ? "0" + month : month), (day < 10 ? "0" + day : day), year].join("/")
  case "monthYear":
    return `${monthString.long} ${year}`
  case "numericMonthShortYear":
    return `${month}/${year.toString().slice(-2)}`
  case "numericMonthYear":
    return `${month}/${year}`
  case "object":
    return { month: month, year: year, day: day }
  case "shortMonthYear":
    return `${monthString.short} ${year}`
  case "yyyy-mm-dd":
    return [year, (month < 10 ? "0" + month : month), (day < 10 ? "0" + day : day)].join("-")
  default:
    return `${monthString.short} ${day}, ${year}`
  }
}

export const fromDateString = (dateString, opts = { format: "default" }) => {
  const dateElements = dateString.split("-")
  const month = parseInt(dateElements[1] || 0)
  const day = parseInt(dateElements[2] || 0)
  const year = parseInt(dateElements[0] || 1900)
  return formatted({ month: month, year: year, day: day, format: opts.format })
}

export const endOfDayFromDateString = dateString => (
  new Date(`${dateString}T23:59:59`)
)

export const fromDateTimeObject = (object, opts = { format: "yyyy-mm-dd" }) => {
  const parsed = object.split(",")[0].split("/").map(str => parseInt(str))
  const { month, year, day } = { year: parsed[2], month: parsed[0], day: parsed[1] }
  return formatted({ month: month, year: year, day: day, format: opts.format })
}

export const nextMonth = ({ month, year }) => {
  if (month === 12) {
    return { month: 1, year: (year + 1) }
  } else {
    return { month: (month + 1), year: year }
  }
}

export const prevMonth = ({ month, year }) => {
  if (month === 1) {
    return { month: 12, year: (year - 1) }
  } else {
    return { month: (month - 1), year: year }
  }
}

export const isInRange = (dateString, dateRange) => {
  if (dateString === null) {
    return false
  }
  return onOrAfter(dateString, dateRange[0]) && onOrBefore(dateString, dateRange[1])
}

const onOrAfter = (dateString, targetString) => {
  if (dateString === null) { return false }
  const object = fromDateString(dateString, { format: "object" })
  const target = fromDateString(targetString, { format: "object" })
  if (object.year > target.year) {
    return true
  } else if (object.year < target.year) {
    return false
  } else { // in the same year
    if (object.month > target.month) {
      return true
    } else if (object.month < target.month) {
      return false
    } else { // in same month/year
      return object.day >= target.day
    }
  }
}

const onOrBefore = (dateString, targetString) => {
  if (dateString === null) { return false }
  const object = fromDateString(dateString, { format: "object" })
  const target = fromDateString(targetString, { format: "object" })
  if (object.year < target.year) {
    return true
  } else if (object.year > target.year) {
    return false
  } else { // in the same year
    if (object.month < target.month) {
      return true
    } else if (object.month > target.month) {
      return false
    } else { // in same month/year
      return object.day <= target.day
    }
  }
}

export const before = (dateString, targetString) => {
  if (dateString === null) { return false }
  const object = fromDateString(dateString, { format: "object" })
  const target = fromDateString(targetString, { format: "object" })
  if (object.year < target.year) {
    return true
  } else if (object.year > target.year) {
    return false
  } else { // in the same year
    if (object.month < target.month) {
      return true
    } else if (object.month > target.month) {
      return false
    } else { // in same month/year
      return object.day < target.day
    }
  }
}

const simpleObject = (dateObject) => (
  formatted({
    year: dateObject.getFullYear(),
    month: (dateObject.getMonth() + 1),
    day: dateObject.getDate(),
    format: "object"
  })
)

export const today = (format = "yyyy-mm-dd") => {
  const date = simpleObject(new Date())
  return formatted({ ...date, format: format })
}

export const isToday = (date) => {
  return JSON.stringify(today("object")) === JSON.stringify(simpleObject(date))
}

const monthOptionDefaults = {
  formatFn: (n) => MonthDictionary(n).long,
  includeNullOption: true,
}

export const monthOptions = (suppliedOptions = {}) => {
  const options = { ...monthOptionDefaults, ...suppliedOptions }
  const initialArray = options.includeNullOption ? [{ value: null, label: "" }] : []

  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].reduce((array, number) => (
    [...array, { label: options.formatFn(number), value: number }]
  ), initialArray)
}

export default formatted
