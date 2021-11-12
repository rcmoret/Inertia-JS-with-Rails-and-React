import { v4 as uuid } from "uuid";
// import { Inertia } from "@inertiajs/inertia";

import { decimalToInt } from "../../lib/MoneyFormatter";

export const reducer = (event, form, payload) => {
  const category = form.categories.find(c => c.id === payload.budgetCategoryId)

  switch(event) {
    case "addItem":
      return {
        ...form,
        newItems: [
          ...form.newItems,
          {
            id: uuid(),
            amount: decimalToInt(form.selectedCategory.displayAmount),
            budgeted: 0,
            budgetCategoryId: category.id,
            defaultAmount: category.defaultAmount,
            displayAmount: form.selectedCategory.displayAmount,
            iconClassName: category.iconClassName,
            isAccrual: category.isAccrual,
            isExpense: category.isExpense,
            isMonthly: category.isMonthly,
            data: {},
            name: category.name,
            radioStatus: null,
            spent: 0,
          }
        ],
        categoryOptions: form.categoryOptions.filter(option => option.value !== category.id || category.isMonthly),
      }
    case "adjustExistingItem":
      return {
        ...form,
        existingItems: form.existingItems.map(item => (
          item.id === payload.id ? { ...item, ...payload, amount: decimalToInt(payload.displayAmount), isChanged: true } : item
        ))
      }
    case "adjustNewItem":
      return {
        ...form,
        newItems: form.newItems.map(item => (
          item.id === payload.id ? { ...item, ...payload, amount: decimalToInt(payload.displayAmount) } : item
        ))
      }
    case "categorySelectUpdate":
      return {
        ...form,
        selectedCategory: {
          ...form.selectedCategory,
          ...payload,
        }
      }
    case "removeItem":
      return {
        ...form,
        existingItems: form.existingItems.filter(item => item.id !== payload.id),
        newItems: form.newItems.filter(item => item.id !== payload.id),
        removedItems: [
          ...form.removedItems,
          payload,
        ],
      }
    default:
     return form
  }
};

const dataFor = ({ data }) => {
  if (data === null || data === undefined || Object.keys(data).length === 0) {
    return null
  } else {
    return JSON.stringify(data)
  }
}

const newItemEvent = (item, month, year) => ({
  amount: item.amount,
  budgetCategoryId: item.budgetCategoryId,
  eventType: "setup_item_create",
  month,
  year,
  data: dataFor(item)
})

const adjustItemEvent = item => ({
  amount: item.amount,
  budgetItemId: item.id,
  eventType: "setup_item_adjust",
  data: dataFor(item)
})

const deleteItemEvent = item => ({
  budgetItemId: item.id,
  eventType: "setup_item_delete",
  data: dataFor(item)
})

export const eventsReducer = ({ existingItems, newItems, removedItems, month, year }) => [
  ...newItems.map(item => newItemEvent(item, month, year)),
  ...existingItems.filter(item => item.isChanged).map(adjustItemEvent),
  ...removedItems.map(deleteItemEvent),
]

export const postEvents = body => {
  Inertia.post("/budget/set-up", body)
}
