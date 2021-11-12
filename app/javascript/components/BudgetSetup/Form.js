import { v4 as uuid } from "uuid";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { asOption } from "../../lib/Functions";

const Form = (props) => {
  const { baseInterval, categories, targetInterval } = props
  const { month, year } = targetInterval
  const existingItems = targetInterval.items.map(item => existingItem(item))
  const targetIntervalDayToDayCategoryIds = existingItems
    .filter(item => !item.isMonthly).map(i => i.budgetCategoryId)
  const excludeDayToDayFilter = objectId => !targetIntervalDayToDayCategoryIds.includes(objectId)
  const categoryOptions = categories
    .filter(category => excludeDayToDayFilter(category.id))
    .map(category => ({ ...asOption(category), isMonthly: category.isMonthly }))
  const defaultAmountLookUp = item => categories.find(c => c.id === item.budgetCategoryId).defaultAmount
  const newItems = baseInterval.items
    .filter(item => excludeDayToDayFilter(item.budgetCategoryId))
    .map(item => newItem({ item, defaultAmount: defaultAmountLookUp(item) }))

  return {
    existingItems,
    newItems,
    removedItems: [],
    categoryOptions,
    categories,
    selectedCategory: { budgetCategoryId: null, displayAmount: "" },
    targetMonth: targetInterval.month,
    targetYear: targetInterval.year,
  }
};

const existingItem = item => ({
  ...item,
  data: {},
  displayAmount: MoneyFormatter(item.amount),
  isChanged: false,
})

const newItem = ({ item, defaultAmount }) => {
  const defaultAttributes = { displayAmount: "", amount: 0, radioStatus: null }
  const accrualAttributes = {
    displayAmount: MoneyFormatter(defaultAmount),
    amount: defaultAmount,
    radioStatus: "default",
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

export default Form;
