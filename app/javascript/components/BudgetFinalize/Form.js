import { asOption, generateIdentifier, sortByName as sortFn } from '../../lib/Functions';
import { extraFrom } from './Functions';
import MoneyFormatter, { decimalToInt } from '../../lib/MoneyFormatter';

const Form = props => {
  const { baseInterval, categories, targetInterval } = props
  const { discretionary } = baseInterval
  const { month, year } = targetInterval
  const baseIntervalItems = baseInterval.items
  const targetIntervalItems = targetInterval.items

  const baseIntervalCategoryIds = baseIntervalItems.map(item => item.budgetCategoryId)
  const targetIntervalCategoryIds = targetIntervalItems.map(item => item.budgetCategoryId)

  const newModel = category => {
    const { isAccrual, isMonthly } = category
    const availableItems = targetIntervalItems
      .filter(item => item.budgetCategoryId === category.id)
      .map(({ key, budgeted }) => ({
        name: `${key} - ${MoneyFormatter(budgeted, { decorate: true })}`,
        budgetItemKey: key,
        budgeted,
        isNew: false,
        eventType: 'rollover_item_adjust',
      }))
    const newItem = (_item, index) => (
      {
        name: `New (${index})`,
        budgetItemKey: generateIdentifier(),
        budgeted: 0,
        isNew: true,
        eventType: 'rollover_item_create',
      }
    )

    const baseItems = baseIntervalItems.filter(item => item.budgetCategoryId === category.id)

    const newItemEvents = () => {
      if ((isMonthly && !isAccrual) || availableItems.length === 0) {
        return baseItems.map(newItem)
      } else {
        return []
      }
    }
    const targetItems = [...availableItems, ...newItemEvents()]

    return {
      ...category,
      baseItems: baseItems.map(item => {
        const inputAmount = isAccrual ? MoneyFormatter(item.remaining) : ''
        const status = isAccrual ? 'rolloverAll' : null
        const rolloverAmount = isAccrual ? item.remaining : null
        const targetItemKey = baseItems.length === 1 && availableItems.length <= 1 ? targetItems[0].budgetItemKey : null
        return { ...item, inputAmount, status, rolloverAmount, targetItemKey }
      }),
      targetItems
    }
  }

  const models = categories.reduce((array, category) => {
    if (baseIntervalCategoryIds.includes(category.id)) {
      return [...array, newModel(category)]
    } else {
      return array
    }
  }, [])

  const availableCategories = categories
    .sort(sortFn)
    .reduce((array, category) => {
    if (targetIntervalCategoryIds.includes(category.id)) {
      return array
    } else {
      return [...array, asOption(category)]
    }
  }, [])

  const rolloverItem = {
    data: [],
    discretionary: (discretionary.amount * -1),
    extraBalance: models.reduce((sum, model) => sum + extraFrom(model), 0),
    budgetCategoryId: null,
    name: '',
  }

  return {
    availableCategories,
    models,
    month,
    rolloverItem,
    year,
  }
};

export const reducer = (event, form, payload) => {
  const updateBudgetModel = (form, formProps) => {
    const { budgetCategoryId, key, ...objectProps } = formProps
    const model = form.models.find(model => model.id === budgetCategoryId)
    const originalItem = model.baseItems.find(item => item.key === key)
    const rolloverAmount = objectProps.hasOwnProperty("inputAmount") ?
      decimalToInt(objectProps.inputAmount) : originalItem.rolloverAmount
    const determineStatus = () => {
      if (rolloverAmount === 0) {
        return "rolloverNone"
      } else if (rolloverAmount === originalItem.remaining) {
        return "rolloverAll"
      } else {
        return "rolloverPartial"
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
      baseItems: model.baseItems.map(item => item.key === key ? updatedItem : item),
    }
    const models = form.models.map(model => model.id === budgetCategoryId ? updatedModel : model)
    const updatedData = () => {
      if (status === "rolloverAll") {
        return form.rolloverItem.data.filter(datum => datum.key === key)
      } else {
        const itemKeys = form.rolloverItem.data.map(datum => datum.key)
        const itemData = {
          name: model.name,
          key: key,
          amount: MoneyFormatter((originalItem.remaining - rolloverAmount), { decorate: false }),
        }
        if (!itemKeys.includes(key)) {
          return [
            ...form.rolloverItem.data,
            itemData,
          ].sort(sortFn)
        } else {
          return form.rolloverItem.data.map(datum => datum.key === key ?  itemData : datum).sort(sortFn)
        }
      }
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
};

export default Form;
