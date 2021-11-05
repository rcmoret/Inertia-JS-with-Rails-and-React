import { v4 as uuid } from 'uuid';
import { asOption } from '../../lib/Functions';
import { extraFrom } from './Functions';
import MoneyFormatter from '../../lib/MoneyFormatter';

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
      .map(({ budgetItemId, budgeted }) => ({
        name: `${budgetItemId} - ${MoneyFormatter(budgeted, { decorate: true })}`,
        budgetItemId,
        budgeted,
        eventType: 'rollover_item_adjust',
      }))
    const newItem = (_item, index) => (
      {
        name: `New (${index})`,
        budgetItemId: uuid(),
        budgeted: 0,
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
        const targetItemId = baseItems.length === 1 && availableItems.length <= 1 ? targetItems[0].budgetItemId : null
        return { ...item, inputAmount, status, rolloverAmount, targetItemId }
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

  const availableCategories = categories.reduce((array, category) => {
    if (targetIntervalCategoryIds.includes(category.id)) {
      return array
    } else {
      return [...array, asOption(category)]
    }
  }, [])

  const rolloverItem = {
    data: {},
    discretionary: (discretionary * -1),
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

export default Form;
