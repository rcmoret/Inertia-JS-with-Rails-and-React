export const reducer = (event, state, payload) => {
  switch(event) {
    case "updateRolloverItem":
      return updateRolloverItem(state, payload)
    case "updateRolloverAmount":
      return updateRolloverAmount(state, payload)
    case "updateSelectedItem":
      return updateSelectedItem(state, payload)
    default:
     return state
  }
}

export const extraBalanceReducer = (discretionary, reviewItems) => {
  const extraBalance = reviewItems.reduce((sum, item) => (sum + item.extra), 0)
  const totalExtra = extraBalance + discretionary

  return { discretionary, extraBalance, totalExtra }
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
    } else if (displayAmount === '' || rolloverAmount === 0) {
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

export default reducer;
