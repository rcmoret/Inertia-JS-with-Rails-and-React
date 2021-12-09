import { Inertia } from "@inertiajs/inertia";

import { fromDateString } from "../../lib/DateFormatter";
import MoneyFormatter from "../../lib/MoneyFormatter";
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

export const itemModel = item  => {
  return {
    ...item,
    difference: (item.difference * -1),
    events: item.events.map(eventModel),
    inputAmount: MoneyFormatter(item.amount, { decoarate: false }),
    transactionDetails: item.transactionDetails.map(transactionDetailModel),
    updateAmount: null,
  }
}

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


const defaultCallbacks = { onSuccess: () => null }

const postEvents = ({ events, month,  year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const onSuccess = page => callbacks.onSuccess(page)

  Inertia.post(
    `/budget/items/events?month=${month}&year=${year}`,
    { events },
    { preserveScroll: true , onSuccess: onSuccess }
  )
}

export const postItemCreateEvent = (itemProps, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const { budgetCategoryId, amount, month, year } = itemProps
  const events = [
    {
      budgetCategoryId,
      amount,
      eventType: "item_create",
      month,
      year,
      data: null,
    }
  ]
  postEvents({ events, month, year }, callbacks)
}

export const postItemAdjustEvent = ({ id, amount, month, year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const event = {
    budgetItemId: id,
    amount,
    eventType: "item_adjust",
    data: null
  }
  postEvents({ events: [event], month, year }, callbacks)
}

export const postItemDeleteEvent = ({ id, amount, month, year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const event = {
    budgetItemId: id,
    eventType: "item_delete",
    data: null
  }
  postEvents({ events: [event], month, year }, callbacks)
}
