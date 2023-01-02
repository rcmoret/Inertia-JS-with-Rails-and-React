import { Inertia } from "@inertiajs/inertia";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { generateIdentifier, eventForm } from "../../lib/Functions";

export const isSubmittable = ({ models, rolloverItem }) => {
  const baseItems = models.reduce((array, model) => [...array, ...model.baseItems], [])
  return rolloverItem.budgetCategoryId !== null && baseItems.every(item => item.targetItemKey !== null && item.status !== null)
}

export const formReducer = ({ models, month, rolloverItem, year }) => {
  const newEvent = (baseItem, targetItems, id) => {
    const { key, rolloverAmount, targetItemKey } = baseItem
    const targetItem = targetItems.find(targetItem => targetItem.budgetItemKey === targetItemKey)
    const { budgeted, eventType } = targetItem

    const amount = (rolloverAmount + budgeted)
    const data = { [key]: { amount: MoneyFormatter(rolloverAmount) } }

    if (targetItem.eventType === "rollover_item_create") {
      return { amount, data, eventType, budgetCategoryId: id, month, year, budgetItemKey: targetItem.budgetItemKey }
    } else {
      return { amount, data, eventType, budgetItemKey: targetItem.budgetItemKey }
    }
  }

  const modelReducer = ({ model, month, year }) => {
    const { id, baseItems, targetItems } = model
    const actionableItems = baseItems.filter(item => item.status !== "rolloverNone")

    return actionableItems.reduce((events, item) => {
      const { targetItemKey } = item
      if (events.map(ev => ev.budgetItemId).includes(targetItemKey)) {
        return events.map(event => {
          if (event.budgetItemKey !== targetItemKey) {
            return { ...event, budgetItemKey: targetItemKey }
          } else {
            return {
              ...event,
              budgetItemKey: targetItemKey,
              amount: (event.amount + item.rolloverAmount),
              data: {
                ...event.data,
                [item.budgetItemKey]: { amount: item.rolloverAmount },
              },
            }
          }
        })
      } else {
        return [...events, newEvent(item, targetItems, id)]
      }
    }, []).map(eventForm)
  }

  return models.reduce((array, model) =>
    [...modelReducer({ model, month, year }), ...array],
    [
      eventForm({
        amount: (rolloverItem.discretionary + rolloverItem.extraBalance),
        budgetItemKey: generateIdentifier(),
        budgetCategoryId: rolloverItem.budgetCategoryId,
        data: rolloverItem.data,
        eventType: "rollover_item_create",
        month: month,
        year: year,
      }),
    ]
  )
}

export const postEvents = ({ month, year, body }) => {
  Inertia.post(`/budget/finalize/${month}/${year}`, body)
}

export const extraFrom = model => (
  model.baseItems.reduce((sum, item) => {
    if (item.rolloverAmount === null) {
      return sum
    } else {
      return sum + item.remaining - item.rolloverAmount
    }
  }, 0)
)

