import { Inertia } from "@inertiajs/inertia";
import { decimalToInt } from "../../lib/MoneyFormatter"

export const reducer = (event, form, payload) => {
  switch(event) {
    case "updateBudgetModel":
      return updateBudgetModel(form, payload)
    case "updateRolloverItem":
      return {
        ...form,
        rolloverItemName: payload.name,
        rolloverItem: {
          ...form.rolloverItem,
          ...payload,
        }
      }
    default:
     return form
  }
}

export const isSubmittable = ({ models, rolloverItem }) => {
  const baseItems = models.reduce((array, model) => [...array, ...model.baseItems], [])
  return rolloverItem.budgetCategoryId !== null && baseItems.every(item => item.targetItemId !== null && item.status !== null)
}

const newEvent = (baseItem, targetItems, { id, month, year }) => {
  const { budgetItemId, rolloverAmount, targetItemId } = baseItem
  const targetItem = targetItems.find(targetItem => targetItem.budgetItemId === targetItemId)
  const { budgeted, eventType } = targetItem

  const baseAttributes = {
    amount: (rolloverAmount + budgeted),
    data: { [budgetItemId]: { amount: rolloverAmount } },
    eventType: eventType,
  }

  if (targetItem.eventType === 'rollover_item_create') {
    return { ...baseAttributes, budgetCategoryId: id, month: month, year: year }
  } else {
    return { ...baseAttributes, budgetItemId: targetItem.budgetItemId }
  }
}

const updatedEvent = (event, { budgetItemId, rolloverAmount }) => {
  return {
    ...event,
    amount: (event.amount + rolloverAmount),
    data: {
      ...event.data,
      [budgetItemId]: { amount: rolloverAmount },
    },
  }
}

const modelReducer = ({ model, month, year }) => {
  const { id, baseItems, targetItems } = model
  const actionableItems = baseItems.filter(item => item.status !== 'rolloverNone')

  return actionableItems.reduce((events, item) => {
    const { targetItemId } = item
    if (events.map(ev => ev.budgetItemId).includes(targetItemId)) {
      return events.map(event => event.budgetItemId === targetItemId ? updatedEvent(event, item) : event)
    } else {
      return [...events, newEvent(item, targetItems, { id, month, year })]
    }
  }, [])
}

export const formReducer = ({ models, month, rolloverItem, year }) => {
  const rolloverItemEvent = {
    amount: (rolloverItem.discretionary + rolloverItem.extraBalance),
    budgetCategoryId: rolloverItem.budgetCategoryId,
    data: rolloverItem.data,
    eventType: 'rollover_item_create',
    month: month,
    year: year,
  }

  const events = models.reduce((array, model) =>
    [...modelReducer({ model, month, year }), ...array],
    [rolloverItemEvent]
  )

  return events.map(eventReducer)
}

const eventReducer = event => {
  const { data, ...eventProps } = event
  if (Object.keys(data).length === 0) {
    return { data: null, ...eventProps }
  } else {
    return { data: JSON.stringify(data), ...eventProps }
  }
}

export const postEvents = eventsBody => {
  Inertia.post('/budget/finalize', eventsBody)
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

const updateBudgetModel = (form, { budgetCategoryId, budgetItemId, ...objectProps }) => {
  const model = form.models.find(model => model.id === budgetCategoryId)
  const originalItem = model.baseItems.find(originalItem => originalItem.budgetItemId === budgetItemId)
  const rolloverAmount = objectProps.hasOwnProperty('inputAmount') ? decimalToInt(objectProps.inputAmount) : originalItem.rolloverAmount
  const determineStatus = () => {
    if (rolloverAmount === 0) {
      return 'rolloverNone'
    } else if (rolloverAmount === originalItem.remaining) {
      return 'rolloverAll'
    } else {
      return 'rolloverPartial'
    }
  }
  const status = determineStatus()
  const updatedItem = {
    ...originalItem,
    ...objectProps,
    rolloverAmount,
    status,
  }
  const updatedModel = {
    ...model,
    baseItems: model.baseItems.map(item => item.budgetItemId === budgetItemId ? updatedItem : item),
  }
  const models = form.models.map(model => model.id === budgetCategoryId ? updatedModel : model)
  const updatedData = () => {
    const itemData = {
      [budgetItemId]: {
        name: model.name,
        amount: (originalItem.remaining - rolloverAmount)
      }
    }
    return Object.entries({ ...form.rolloverItem.data, ...itemData }).reduce((newData, entry) => {
      const key = entry[0]
      const value = entry[1]
      if (key !== budgetItemId || status !== 'rolloverAll') {
        return { ...newData, [key]: value }
      } else {
        return newData
      }
    }, {})
  }

  return {
    ...form,
    models,
    rolloverItem: {
      ...form.rolloverItem,
      data: updatedData(),
      extraBalance: models.reduce((sum, model) => sum + extraFrom(model), 0),
    },
  }
}
