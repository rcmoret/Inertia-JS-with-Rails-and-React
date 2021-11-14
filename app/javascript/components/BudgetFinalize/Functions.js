import { Inertia } from "@inertiajs/inertia";
import { decimalToInt } from "../../lib/MoneyFormatter";
import { eventForm } from "../../lib/Functions";

export const isSubmittable = ({ models, rolloverItem }) => {
  const baseItems = models.reduce((array, model) => [...array, ...model.baseItems], [])
  return rolloverItem.budgetCategoryId !== null && baseItems.every(item => item.targetItemId !== null && item.status !== null)
}

export const formReducer = ({ models, month, rolloverItem, year }) => {
  const newEvent = (baseItem, targetItems, id) => {
    const { budgetItemId, rolloverAmount, targetItemId } = baseItem
    const targetItem = targetItems.find(targetItem => targetItem.budgetItemId === targetItemId)
    const { budgeted, eventType } = targetItem

    const amount = (rolloverAmount + budgeted)
    const data = { [budgetItemId]: { amount: rolloverAmount } }

    if (targetItem.eventType === "rollover_item_create") {
      return { amount, data, eventType, budgetCategoryId: id, month, year }
    } else {
      return { amount, data, eventType, budgetItemId: targetItem.budgetItemId }
    }
  }

  const modelReducer = ({ model, month, year }) => {
    const { id, baseItems, targetItems } = model
    const actionableItems = baseItems.filter(item => item.status !== "rolloverNone")

    return actionableItems.reduce((events, item) => {
      const { targetItemId } = item
      if (events.map(ev => ev.budgetItemId).includes(targetItemId)) {
        return events.map(event => {
          if (event.budgetItemId !== targetItemId) {
            return event
          } else {
            return {
              ...event,
              amount: (event.amount + item.rolloverAmount),
              data: {
                ...event.data,
                [item.budgetItemId]: { amount: item.rolloverAmount },
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
        budgetCategoryId: rolloverItem.budgetCategoryId,
        data: rolloverItem.data,
        eventType: "rollover_item_create",
        month: month,
        year: year,
      }),
    ]
  )
}

export const postEvents = eventsBody => {
  Inertia.post("/budget/finalize", eventsBody)
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

