import MoneyFormatter from "../lib/MoneyFormatter";
import { sortByName as sortFn } from "../lib/Functions"

const FinalizeForm = (props) => {
  const { baseInterval, targetInterval } = props
  const categories = props.categories.map(category => ({...category, label: category.name, value: category.id })).sort(sortFn)
  const discretionary = baseInterval.discretionary * -1
  const reviewItems = baseInterval.items.map(item => (
    reviewItem({ ...item, ...eventForm(targetInterval, item) })
  )).filter(item => item.isReviewable)
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

const reviewItem = (props) => props.isMonthly ? monthlyObject(props) : dayToDayObject(props)

export const Reducer = (event, state, payload) => {
  switch(event) {
    case "updateRolloverItem":
      return updateRolloverItem(state, payload)
    case "updateRolloverAmount":
      return updateRolloverAmount(state, payload)
    case "updateSelectedItem":
      return updateSelectedItem(state, payload)
    default:
     return null
  }
}

const dayToDayObject = (props) => {
  const { isExpense, remaining } = props
  const isReviewable = isExpense ? remaining < 0 : remaining > 0

  return { ...props, isReviewable }
}

const monthlyObject = (props) => {
  const { transactionDetailCount } = props
  const isReviewable = transactionDetailCount === 0

  return { ...props, isReviewable }
}

const extraBalanceReducer = (discretionary, reviewItems) => {
  const extraBalance = reviewItems.reduce((sum, item) => (sum + item.extra), 0)
  const totalExtra = extraBalance + discretionary

  return { discretionary, extraBalance, totalExtra }
}

export const itemReducer = props => {
  const { data, ...eventProps } = props.eventAttributes
  if (Object.keys(data).length === 0) {
    return { ...eventProps }
  } else {
    return { data: JSON.stringify(data), ...eventProps }
  }
}

const updateRolloverItem = (state, payload) => {
  return {
    ...state,
    rolloverItemName: payload.name,
    rolloverItem: {
      ...state.rolloverItem,
      budgetCategoryId: payload.budgetCategoryId,
    }
  }
}

const updatedItem = (item, { displayAmount, eventAttributes, rolloverAmount }) => {
  const { budgeted, remaining } = item
  const itemStatus = () => {
    if (remaining === rolloverAmount) {
      return 'rolloverAll'
    } else if (displayAmount === '' || rolloverAmount) {
      return 'rolloverNone'
    } else {
      return 'rolloverPartial'
    }
  }

  return {
    ...item,
    displayAmount,
    eventAttributes: { ...eventAttributes, amount: (budgeted + rolloverAmount) },
    extra:(remaining - rolloverAmount),
    itemStatus: itemStatus(),
    rolloverAmount,
  }
}

const updateRolloverAmount = (state, payload) => {
  const item = updatedItem(state.reviewItems.find(i => i.budgetItemId === payload.budgetItemId), payload)
  return updatedCollection(state, item)
}

const updateSelectedItem = (state, payload) => {
  const item = state.reviewItems.find(i => i.budgetItemId === payload.budgetItemId)
  const { displayAmount, eventAttributes, rolloverAmount } = item
  const targetItem = item.targetItems.find(i => i.budgetItemId === payload.id)
  const updated = updatedItem({
    ...item,
    budgeted: targetItem.amount,
    eventAttributes: {
      ...eventAttributes,
      budgetItemId: payload.id
    }
  }, {
    displayAmount,
    eventAttributes: {
      ...eventAttributes,
      budgetItemId: payload.id
    },
    rolloverAmount,
  })
  return updatedCollection(state, updated)
}

const updatedCollection = (state, item) => {
  const { budgetItemId, extra, itemStatus, name } = item
  const reviewItems = state.reviewItems.map(i => i.budgetItemId === budgetItemId ? item : i)
  const balances = extraBalanceReducer(state.discretionary, reviewItems)
  const extraData = itemStatus === 'rolloverAll' ? {} : { [budgetItemId]: { name: name,  extra } }

  return {
    ...state,
    ...balances,
    rolloverItem: {
      ...state.rolloverItem,
      amount: (state.discretionary + balances.extraBalance),
      data: { ...state.rolloverItem.data, ...extraData, },
    },
    reviewItems,
  }
}

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
      baseItem: item,
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
    const { amount, budgetItemId } = matchingItems[0]
    const rolloverAmount = isAccrual ? remaining : 0
    return {
      baseItem: item,
      budgeted: amount,
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
      baseItem: item,
      budgeted: 0,
      displayAmount,
      extra,
      itemStatus,
      eventAttributes: {
        budgetItemId: null,
        amount: 0,
        data: { baseItemId: item.budgetItemId },
        eventType: 'rollover_item_adjust',
      },
      rolloverAmount: amount,
      targetItems: matchingItems,
    }
  }
}

export default FinalizeForm;
