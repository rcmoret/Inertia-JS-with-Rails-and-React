export const sortByName = (obj1, obj2) => (
  obj1.name.toLowerCase() < obj2.name.toLowerCase() ? -1 : 1
);

export const sortByLabel = (obj1, obj2) => (
  obj1.label.toLowerCase() < obj2.label.toLowerCase() ? -1 : 1
);

export const sortByPriorty = (a, b) => a.priority - b.priority;

export const sortByClearanceDate = (txn1, txn2) => {
  const today = new Date().toISOString().split("T")[0]
  if (txn1.clearanceDate === txn2.clearanceDate) {
    return txn1.updatedAt < txn2.updatedAt ? -1 : 1
  } else if (txn1.isCleared && txn2.isCleared) {
    return txn1.clearanceDate < txn2.clearanceDate ? -1 : 1
  } else if (txn1.isPending) {
    return txn2.clearanceDate > today ? -1 : 1
  } else {
    return txn1.clearanceDate <= today ? -1 : 1
  }
}

// item filters
export const isAccrual = object => object.isAccrual
export const isNonAccrual = object => !object.isAccrual
export const isMatureAccrual = (object, month, year) => {
  if (object.maturityMonth === null) {
    return false
  } else {
    return object.maturityMonth === month && object.maturityYear === year
  }
}

export const isDayToDay = object => !object.isMonthly
export const isMonthly = object => object.isMonthly

export const isExpense = object => object.isExpense
export const isRevenue = object => !object.isExpense

export const pendingMonthly = object => object.isMonthly && object.transactionDetailCount === 0
export const clearedMonthly = object => object.isMonthly && object.transactionDetailCount > 0

// combined item filters
export const dayToDayExpense = object => isDayToDay(object) && isExpense(object)
export const dayToDayRevenue = object => isDayToDay(object) && isRevenue(object)

export const asOption = (object, optionalFns = {}) => {
  const defaultOptionFns = {
    labelFn: object => object.name,
    valueFn: object => object.id,
  }
  const { labelFn, valueFn } = { ...defaultOptionFns, ...optionalFns }

  return {
    value: valueFn(object),
    label: labelFn(object),
  }
};

// These two functions are so that I can by-pass rails validations in the contoller
// By making the data a JSON string I won't have to permit each key and all the nested options etc
// The model checks to see if valid JSON if passed as a string anyway
export const eventForm = event => ({ ...event, data: dataFor(event.data) })

const dataFor = (data) => {
  if (data && Object.keys(data).length > 0) {
    return JSON.stringify(data)
  } else {
    return null
  }
}

export const newItemEvent = (item, month, year, eventType = "item_create") => {
  const { amount, budgetCategoryId, data } = item

  return eventForm({
    amount,
    budgetCategoryId,
    eventType,
    month,
    year,
    data,
  })
}

export const adjustItemEvent = (item, eventType = "item_adjust") => {
  const { id, amount, data } = item

  return eventForm({
    amount: amount,
    budgetItemId: id,
    eventType,
    data,
  })
}

export const deleteItemEvent = (item, eventType = "item_delete") => (
  eventForm({
    budgetItemId: item.id,
    eventType,
    data: item.data,
  })
)
