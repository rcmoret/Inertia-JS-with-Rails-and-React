export const sortByName = (obj1, obj2) => (
  obj1.name < obj2.name ? -1 : 1
);

const defaultOptionFns = {
  labelFn: object => object.name,
  valueFn: object => object.id,
}

export const asOption = (object, optionalFns = {}) => {
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
