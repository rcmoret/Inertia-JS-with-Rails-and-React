import { v4 as uuid } from "uuid";
import { newItemEvent, adjustItemEvent, deleteItemEvent } from "../../lib/Functions";
// import { Inertia } from "@inertiajs/inertia";

import { decimalToInt } from "../../lib/MoneyFormatter";

export const reducer = (event, form, payload) => {
  const category = form.categories.find(c => c.id === payload.budgetCategoryId)

  switch(event) {
    case "addItem":
      return {
        ...form,
        selectedCategory: { budgetCategoryId: null, displayAmount: "" },
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


export const eventsReducer = ({ existingItems, newItems, removedItems, month, year }) => [
  ...newItems.map(item => newItemEvent(item, month, year, "setup_item_create")),
  ...existingItems.filter(item => item.isChanged).map(item => adjustItemEvent(item, "setup_item_adjust")),
  ...removedItems.map(item => deleteItemEvent(item, "setup_item_delete")),
]

export const postEvents = body => {
  Inertia.post("/budget/set-up", body)
}
