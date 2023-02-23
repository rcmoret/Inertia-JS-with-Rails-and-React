import { v4 as uuid } from "uuid";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { newItemEvent, adjustItemEvent, deleteItemEvent } from "../../lib/Functions";
import { asOption } from "../../lib/Functions";

const Form = (props) => {
  // Functions
  const existingItem = item => ({
    ...item,
    id: item.key,
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

  const { baseInterval, targetInterval } = props
  const { month, year } = targetInterval
  const categories = props.categories.map(category => ({ ...category, requeuedAt: null }))

  const existingItems = targetInterval.items.map(existingItem)

  const targetIntervalDayToDayCategorySlugs = existingItems
    .filter(item => !item.isMonthly).map(i => i.budgetCategorySlug)
  const excludeDayToDayFilter = objectSlug => !targetIntervalDayToDayCategorySlugs.includes(objectSlug)

  const defaultAmountLookUp = item => categories.find(c => c.slug === item.budgetCategorySlug).defaultAmount
  const excludeAccrualsFilter = categorySlug => {
    const accrualCategorySlugs = existingItems.filter(i => i.isAccrual).map(i => i.budgetCategorySlug)
    return !accrualCategorySlugs.includes(categorySlug)
  }
  const newItems = baseInterval.items
    .filter(item => {
      const { budgetCategorySlug } = item
      return excludeDayToDayFilter(budgetCategorySlug) && excludeAccrualsFilter(budgetCategorySlug)
    })
    .map(item => newItem({ item, defaultAmount: defaultAmountLookUp(item) }))

  const baseIntervalDayToDayCategorySlugs = newItems.map(i => i.budgetCategorySlug)
  const valueFn = category => category.slug
  const categoryOptions = categories
    .filter(category => excludeDayToDayFilter(category.slug) && !baseIntervalDayToDayCategorySlugs.includes(category.slug))
    .map(category => ({ ...asOption(category, { valueFn }), isMonthly: category.isMonthly }))

  return {
    existingItems,
    newItems,
    removedItems: [],
    categoryOptions,
    categories,
    selectedCategory: { budgetCategorySlug: null, displayAmount: "" },
    month,
    year,
  }
};

export const reducer = (event, form, payload) => {
  const category = form.categories.find(c => c.slug === payload.slug)
  const newItem = () => {
    const { slug, defaultAmount, isAccrual, isExpense, isMonthly, iconClassName, name } = category
    const { displayAmount } = form.selectedCategory
    const uid = uuid()

    return {
      id: uid,
      amount: decimalToInt(displayAmount),
      budgeted: 0,
      budgetCategorySlug: slug,
      defaultAmount: defaultAmount,
      displayAmount: displayAmount,
      iconClassName: iconClassName,
      isAccrual: isAccrual,
      isExpense: isExpense,
      isMonthly: isMonthly,
      name: name,
      status: null,
      spent: 0,
    }
  }

  switch(event) {
    case "addItem":
      return {
        ...form,
        selectedCategory: { budgetCategorySlug: null, displayAmount: "" },
        newItems: [
          ...form.newItems,
          newItem(),
        ],
        categoryOptions: form.categoryOptions.filter(option => option.value !== category.slug || category.isMonthly),
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
          ...form.existingItems.filter(item => item.id === payload.id),
        ],
      }
    case "requeueCategory":
      return {
        ...form,
        categories: form.categories.map(category => category.slug === payload.slug ? { ...category, requeuedAt: new Date () } : category),
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
