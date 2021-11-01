import MoneyFormatter from "../../lib/MoneyFormatter";
import { sortByName as sortFn } from "../../lib/Functions"
import { extraBalanceReducer } from "./Reducer"

const Form = (props) => {
  const { baseInterval, targetInterval } = props
  const categories = props.categories.map(category => (
    { ...category, label: category.name, value: category.id }
  )).sort(sortFn)
  const discretionary = baseInterval.discretionary * -1
  const reviewItems = baseInterval.items.map(item => (
    { ...item, ...eventForm(targetInterval, item) }
  ))
  const balances = extraBalanceReducer(discretionary, reviewItems)

  return {
    categories,
    ...balances,
    reviewItems,
    rolloverItem: {
      amount: discretionary,
      budgetCategoryId: null,
      data: {},
      eventType: 'rollover_item_create',
      month: targetInterval.month,
      remaining: discretionary,
      year: targetInterval.year,
    },
    rolloverItemName: '',
  }
};

const eventForm = (targetInterval, item) => {
  const { items, month, year } = targetInterval
  const { budgetCategoryId, isAccrual, remaining } = item
  const itemStatus = isAccrual ? 'rolloverAll' : ''
  const displayAmount = isAccrual ? MoneyFormatter(remaining) : ''
  const extra = 0

  const matchingItems = items
    .filter(item => item.budgetCategoryId === budgetCategoryId)
    .map(({ budgetItemId, amount }) => ({ budgetItemId, amount }))

  if (matchingItems.length === 0) {
    const amount = isAccrual ? remaining : 0
    return {
      budgeted: 0,
      displayAmount,
      extra,
      itemStatus,
      eventAttributes: {
        amount,
        budgetCategoryId: budgetCategoryId,
        eventType: 'rollover_item_create',
        data: {},
        month: month,
        year: year,
      },
      rolloverAmount: amount,
      targetItems: [{ budgetItemId: null, amount: 0 }],
    }
  } else if (matchingItems.length === 1) {
    const { budgetItemId } = matchingItems[0]
    const budgeted = matchingItems[0].amount
    const amount = isAccrual ? (budgeted + remaining) : budgeted
    const rolloverAmount = isAccrual ? remaining : 0
    return {
      budgeted,
      displayAmount,
      extra,
      itemStatus,
      eventAttributes: {
        budgetItemId: budgetItemId,
        amount,
        data: { baseItemId: item.budgetItemId },
        eventType: 'rollover_item_adjust',
      },
      rolloverAmount,
      targetItems: matchingItems,
    }
  } else {
    const amount = isAccrual ? remaining : 0
    return {
      budgeted: 0,
      displayAmount,
      extra,
      itemStatus,
      eventAttributes: {
        budgetItemId: null,
        amount: amount,
        data: { baseItemId: item.budgetItemId },
        eventType: 'rollover_item_adjust',
      },
      rolloverAmount: amount,
      targetItems: matchingItems,
    }
  }
}

export default Form;
