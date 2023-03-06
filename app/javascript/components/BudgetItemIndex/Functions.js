import { router } from "@inertiajs/react";

import { fromDateString } from "../../lib/DateFormatter";
import MoneyFormatter from "../../lib/MoneyFormatter";
import { adjustItemEvent, deleteItemEvent, newItemEvent, sortByClearanceDate } from "../../lib/Functions";
import { index as copy } from "../../lib/copy/budget";
import { shared as transactionCopy } from "../../lib/copy/transactions";

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
};

export const itemModel = (item, daysRemaining, totalDays)  => {
  const baseItem = {
    ...item,
    id: item.key,
    difference: (item.difference * -1),
    events: item.events.map(eventModel),
    inputAmount: MoneyFormatter(item.amount, { decoarate: false }),
    transactionDetails: item.transactionDetails.map(transactionDetailModel),
    updateAmount: null,
  }
  if (item.isPerDiemEnabled) {
    return { ...baseItem, ...perDiemAttributes(item, daysRemaining, totalDays) }
  } else {
    return baseItem
  }
};

const perDiemAttributes = (item, daysRemaining, totalDays) => {
  const budgetedPerDay = Math.round(item.amount / totalDays)

  const budgeted = {
    budgetedPerDay,
    budgetedPerWeek: (budgetedPerDay * 7),
  }

  if (daysRemaining < 7) {
    return budgeted
  } else {
    const remainingPerDay = Math.round(item.remaining / daysRemaining)
    return { ...budgeted, remainingPerDay, remainingPerWeek: (remainingPerDay * 7), }
  }
};

export const transactionDetailModel = detail => {
  const isPending = detail.clearanceDate === null
  const clearanceDate = isPending ? transactionCopy.pending : fromDateString(detail.clearanceDate)
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
};

export const eventAndTransactionDetailSort = (obj1, obj2) => {
  const today = new Date()
  if (obj1.isBudgetItemEvent && obj1.typeDescription.includes("create")) {
    return -1
  } else if (obj2.isBudgetItemEvent && obj2.typeDescription.includes("create")) {
    return 1
  } else if (!obj1.isPending && !obj2.isPending) {
    return obj1.comparisonDate > obj2.comparisonDate ? 1 : -1
  } else if (obj1.isPending  && obj2.isPending) {
    return 0
  } else if (obj1.isPending) {
    return fromDateString(obj2.comparisonDate, { format: "dateObject" }) > today ? -1 : 1
  } else if (obj2.isPending) {
    return fromDateString(obj1.comparisonDate, { format: "dateObject" }) <= today ? -1 : 1
  }
};

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
};

const defaultCallbacks = { onSuccess: () => null }

export const postEvents = ({ events, month, year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }

  router.post(
    `/budget/items/events?month=${month}&year=${year}`,
    { events },
    { preserveScroll: true }
  )
};

export const postItemCreateEvent = (itemProps, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const { budgetCategorySlug, budgetItemKey, amount, month, year } = itemProps
  const events = [
    {
      budgetCategorySlug,
      budgetItemKey,
      amount,
      eventType: "item_create",
      month,
      year,
      data: null,
    }
  ]
  postEvents({ events, month, year }, callbacks)
};

export const postItemAdjustEvent = ({ id, amount, month, year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const event = {
    budgetItemKey: id,
    amount,
    eventType: "item_adjust",
    data: null
  }
  postEvents({ events: [event], month, year }, callbacks)
};

export const postItemDeleteEvent = ({ itemKey, amount, month, year }, suppliedCallbacks = {}) => {
  const callbacks = { ...defaultCallbacks, ...suppliedCallbacks }
  const event = {
    budgetItemKey: itemKey,
    eventType: "item_delete",
    data: null
  }
  postEvents({ events: [event], month, year }, callbacks)
};

export const eventsFrom = (items, month, notes, year) => {
  const data = {
    items: items.map(item => {
      const {
        key,
        name,
        bottomLineChange,
        amount,
        adjustmentAmount,
        eventType,
        isMarkedForDelete,
        slug,
      } = item
      const event = isMarkedForDelete ? "delete" : eventType.split("_").reverse()[0]
      return {
        key,
        name,
        event,
        budgetCategorySlug: slug,
        originalAmount: MoneyFormatter(amount, { decorate: true }),
        adjustmentAmount: MoneyFormatter(adjustmentAmount, { decorate: true }),
        updatedAmount: MoneyFormatter(amount + adjustmentAmount, { decorate: true }),
        bottomLineChange: MoneyFormatter(bottomLineChange, { decorate: true }),
      }
    }),
    bottomLineChange: MoneyFormatter(items.reduce((sum, i) => sum + i.bottomLineChange, 0), { decorate: true }),
    notes,
  }

  return items.map(item => {
    const {
      key,
      adjustmentAmount,
      budgetCategoryId,
      eventType,
      isMarkedForDelete,
      isNewItem,
      slug,
    } = item
    const amount = item.amount + adjustmentAmount
    if (isNewItem) {
      const object = { amount, budgetCategorySlug: slug, data }
      return newItemEvent(object, month, year, eventType)
    } else if (isMarkedForDelete) {
      const object = { key, data }
      return deleteItemEvent(object, copy.multiItemAdjustForm.events.delete)
    } else {
      const object = { key, amount, data }
      return adjustItemEvent(object, eventType)
    }
  })
};
