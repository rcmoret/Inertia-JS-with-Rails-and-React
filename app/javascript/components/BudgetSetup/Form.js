import { v4 as uuid } from "uuid";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { newItemEvent, adjustItemEvent, deleteItemEvent } from "../../lib/Functions";
import { asOption } from "../../lib/Functions";

const Form = (props) => {
  // Functions
  const existingItem = item => ({
    ...item,
    data: {},
    displayAmount: MoneyFormatter(item.amount),
    originalAmount: item.amount,
  })

  const newItem = ({ item, defaultAmount }) => {
    const defaultAttributes = { displayAmount: "", amount: 0, status: null }
    const accrualAttributes = {
      displayAmount: MoneyFormatter(defaultAmount),
      amount: defaultAmount,
      status: "default",
    }
    const attributes = item.isAccrual ? accrualAttributes : defaultAttributes

    return {
      ...item,
      ...attributes,
      id: uuid(),
      data: {},
      defaultAmount,
    }
  }

  const { baseInterval, categories, targetInterval } = props
  const { month, year } = targetInterval

  const existingItems = targetInterval.items.map(item => existingItem(item))

  const targetIntervalDayToDayCategoryIds = existingItems
    .filter(item => !item.isMonthly).map(i => i.budgetCategoryId)
  const excludeDayToDayFilter = objectId => !targetIntervalDayToDayCategoryIds.includes(objectId)

  const defaultAmountLookUp = item => categories.find(c => c.id === item.budgetCategoryId).defaultAmount
  const newItems = baseInterval.items
    .filter(item => excludeDayToDayFilter(item.budgetCategoryId))
    .map(item => newItem({ item, defaultAmount: defaultAmountLookUp(item) }))

  const baseIntervalDayToDayCategoryIds = newItems.map(i => i.budgetCategoryId)
  const categoryOptions = categories
    .filter(category => excludeDayToDayFilter(category.id) && !baseIntervalDayToDayCategoryIds.includes(category.id))
    .map(category => ({ ...asOption(category), isMonthly: category.isMonthly }))

  return {
    existingItems,
    newItems,
    removedItems: [],
    categoryOptions,
    categories,
    selectedCategory: { budgetCategoryId: null, displayAmount: "" },
    month: month,
    year: year,
  }
};

export const reducer = (event, form, payload) => {
  const category = form.categories.find(c => c.id === payload.budgetCategoryId)
  const newItem = () => {
    const { id, defaultAmount, isAccrual, isExpense, isMonthly, iconClassName, name } = category
    const { displayAmount } = form.selectedCategory
    const uid = uuid()

    return {
      id: uid,
      amount: decimalToInt(displayAmount),
      budgeted: 0,
      budgetCategoryId: id,
      defaultAmount: defaultAmount,
      displayAmount: displayAmount,
      iconClassName: iconClassName,
      isAccrual: isAccrual,
      isExpense: isExpense,
      isMonthly: isMonthly,
      data: { uuid: uid },
      name: name,
      status: null,
      spent: 0,
    }
  }

  switch(event) {
    case "addItem":
      return {
        ...form,
        selectedCategory: { budgetCategoryId: null, displayAmount: "" },
        newItems: [
          ...form.newItems,
          newItem(),
        ],
        categoryOptions: form.categoryOptions.filter(option => option.value !== category.id || category.isMonthly),
      }
    case "adjustExistingItem":
      return {
        ...form,
        existingItems: form.existingItems.map(item => (
          item.id === payload.id ? { ...item, ...payload, amount: decimalToInt(payload.displayAmount) } : item
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

export const eventsReducer = ({ existingItems, newItems, removedItems, month, year }) => {
  const isChanged = item => item.amount !== item.originalAmount

  return [
    ...newItems.filter(i => i.amount !== 0).map(item => newItemEvent(item, month, year, "setup_item_create")),
    ...existingItems.filter(isChanged).map(item => adjustItemEvent(item, "setup_item_adjust")),
    ...removedItems.map(item => deleteItemEvent(item, "setup_item_delete")),
  ]
}

export default Form;
