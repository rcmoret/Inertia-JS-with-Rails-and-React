import { fromDateString } from "../../lib/DateFormatter";
import { sortByClearanceDate } from "../../lib/Functions"

const eventModel = event => {
  const data = event.data ? JSON.parse(event.data) : null

  return {
    ...event,
    comparisonDate: event.createdAt,
    createdAt: fromDateString(event.createdAt),
    data,
    isBudgetItemEvent: true,
    isPending: false,
    typeDescription: event.typeDescription.replaceAll("_", " ")
  }
}

export const itemModel = item  => ({
  ...item,
  difference: (item.difference * -1),
  events: item.events.map(eventModel),
  showDetails: false,
  transactionDetails: item.transactionDetails.map(transactionDetailModel),
})

export const transactionDetailModel = detail => {
  const isPending = detail.clearanceDate === null
  const clearanceDate = isPending ? "Pending" : fromDateString(detail.clearanceDate)
  const description = detail.description || detail.categoryName

  return {
    ...detail,
    clearanceDate,
    comparisonDate: detail.clearanceDate,
    description,
    isCleared: !isPending,
    isPending: isPending,
    isTransactionDetail: true,
  }
}

export const eventAndTransactionDetailSort = (obj1, obj2) => {
  const today = new Date()
  if (!obj1.isPending && !obj2.isPending) {
    return obj1.comparisonDate > obj2.comparisonDate ? 1 : -1
  } else if (obj1.isPending  && obj2.isPending) {
    return 0
  } else if (obj1.isPending) {
    return obj2.comparisonDate > today ? -1 : 1
  } else if (obj2.isPending) {
    return obj1.comparisonDate < today ? -1 : 1
  }
}

export const eventTransactionReducer = (array, model) => {
  const prevModel = array[array.length - 1] || { budgeted: 0, remaining: 0 }

  if (model.isBudgetItemEvent) {
    return [
      ...array,
      {
        ...model,
        budgeted: (prevModel.budgeted + model.amount),
        prevBudgeted: prevModel.budgeted,
        remaining: (prevModel.remaining - model.amount),
        prevRemaining: prevModel.remaining,
      }
    ]
  } else {
    return [
      ...array,
      {
        ...model,
        budgeted: prevModel.budgeted,
        prevBudgeted: prevModel.budgeted,
        remaining: (prevModel.remaining + model.amount),
        prevRemaining: prevModel.remaining,
      }
    ]
  }
}
