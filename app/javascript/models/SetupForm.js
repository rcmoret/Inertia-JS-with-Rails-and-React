import { v4 as uuid } from 'uuid';
import MoneyFormatter, { decimalToInt } from '../lib/MoneyFormatter';

const SetupForm = (props) => {
  const { baseInterval, targetInterval } = props
  const { month, year } = targetInterval
  const categories = categoriesReducer(props.categories)
  const newItems = baseInterval.items.map(item => {
    const defaultAmount = categories.find(c => c.id === item.budgetCategoryId).defaultAmount
    return newItem({...item, defaultAmount: defaultAmount, month: month, year: year })
  })
  const existingItems = targetInterval.items.map(item => existingItem(item))
  const removedItems = []

  const collections = { existingItems, newItems, removedItems }
  const amount = amountReducer(collections)

  return {
    ...collections,
    amount: amount,
    categories: categories,
    selectedCategoryId: null,
  }
};

export const Reducer = (event, state, payload) => {
  const newCollections = collectionsReducer(event, state, payload)

  return {
    ...newCollections,
    amount: amountReducer(newCollections),
  }
}

const collectionsReducer = (event, state, payload) => {
  switch(event) {
    case "addItem":
      return addItem(state, payload)
    case "adjustExistingItem":
      return adjustExistingItem(state, payload)
    case "adjustNewItem":
      return adjustNewItem(state, payload)
    case "categorySelect":
      return categorySelect(state, payload)
    case "removeNewItem":
      console.log(payload)
      return removeNewItem(state, payload)
    case "removeExistingItem":
      return removeExistingItem(state, payload)
    default:
     return null
  }
}

const amountReducer = ({ newItems, existingItems }) => {
  return (
    [...newItems, ...existingItems].reduce((sum, item) => sum + item.amount, 0)
  )
}

const existingItemDefaults = item => ({
  isChanged: false,
  displayAmount: MoneyFormatter(item.amount)
})

const existingItem = item => {
  const props = { ...existingItemDefaults(item), ...item }
  const amount = decimalToInt(props.displayAmount)
  const eventAttributes = {
    amount: amount,
    id: props.id,
    amount: amount,
    eventType: 'setup_item_adjust',
    data: JSON.stringify({ hello: 'world' }),
  };

  return {
    ...props,
    eventAttributes: eventAttributes,
    amount: amount,
  }
}

const newItemDefaults = item => {
  const baseAttributes = {
    id: uuid(),
    displayAmount: '',
    radioStatus: null,
  }

  if (item.isAccrual || !item.isExpense) {
    return { ...baseAttributes, radioStatus: 'default', displayAmount: MoneyFormatter(item.defaultAmount) }
  } else {
    return baseAttributes
  }
}

const newItem = item => {
  const props = { ...newItemDefaults(item), ...item }
  const eventAttributes = {
    amount: decimalToInt(props.displayAmount),
    eventType: 'setup_item_create',
    month: props.month,
    year: props.year,
    budgetCategoryId: props.budgetCategoryId,
    data: JSON.stringify({ hello: 'world' }),
  }

  return {
    ...props,
    eventAttributes: eventAttributes,
    amount: decimalToInt(props.displayAmount),
  }
}

const removedItem = item => {
  const eventAttributes = {
    id: item.id,
    eventType: 'setup_item_delete',
    data: JSON.stringify({ hello: 'world' }),
  }

  return {
    ...item,
    eventAttributes: eventAttributes,
  }
};

const addItem = (state, payload) => {
  const item = newItem({
    month: payload.month,
    year: payload.year,
    budgetCategoryId: payload.id,
    name: payload.name,
    defaultAmount: payload.defaultAmount,
    spent: 0,
    budgeted: 0,
    isAccural: payload.isAccural,
    isExpense: payload.isExpense,
    isMonthly: payload.isMonthly
  })


  return {
    ...state,
    selectedCategoryId: null,
    newItems: [...state.newItems, item],
  }
};

const removeNewItem = (state, payload) => ({
  ...state,
  newItems: state.newItems.filter(item => item.id !== payload.id)
});

const removeExistingItem = (state, payload) => ({
  ...state,
  existingItems: state.existingItems.filter(item => payload.id !== item.id),
  removedItems: [
    ...state.removedItems,
    removedItem({ id: payload.id }),
  ],
});

const adjustExistingItem = (state, payload) => {
  return {
    ...state,
    existingItems: state.existingItems.map(item => (
      payload.id === item.id ? existingItem({ ...item, ...payload }) : item
    ))
  }
};

const adjustNewItem = (state, payload) => (
  {
    ...state,
    newItems: state.newItems.map(item => (
      payload.id === item.id ? newItem({ ...item, ...payload }) : item
    ))
  }
);

const categorySelect = (state, payload) => (
  { ...state, selectedCategoryId: payload.value }
)

export const categoryFilterFn = (category, dayToDayItemIds) => (
  category.isMonthly || !dayToDayItemIds.includes(category.id)
)

const categoriesReducer = collection => (
  collection.map(category => (
    { ...category, value: category.id, label: category.name }
  ))
)

export const eventsReducer = collections => {
  const { newItems, removedItems } = collections

  const existingItems = collections.existingItems.filter(item => item.isChanged)
  const events = [...existingItems, ...newItems, ...removedItems].map(item => item.eventAttributes)
  return { events }
};

export default SetupForm;
