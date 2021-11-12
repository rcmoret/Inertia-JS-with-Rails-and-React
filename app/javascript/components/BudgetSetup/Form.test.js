import Form, { Reducer, categoryFilterFn } from "./Form"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

const baseCategory = {
  id: "442",
  defaultAmount: -2400,
  name: "Groceries, etc",
  isAccrual: false,
  isMonthly: false,
  isExpense: true,
}

const baseBaseItem = ({ category, ...overrides }) => ({
  name: category.name,
  budgeted: -1280,
  iconClassName: "fa-fa-fa",
  spent: -2299,
  ...overrides,
  budgetCategoryId: category.id,
  isAccrual: category.isAccrual,
  isExpense: category.isExpense,
  isMonthly: category.isMonthly,
})

const baseTargetItem = ({ category, ...overrides }) => ({
  id: "8898",
  name: category.name,
  amount: -1000,
  iconClassName: "fa-fa-fa",
  ...overrides,
  budgetCategoryId: category.id,
  isAccrual: category.isAccrual,
  isExpense: category.isExpense,
  isMonthly: category.isMonthly,
})

const baseTargetInterval = {
  month: 12,
  year: 2022,
  items: []
}

const baseBaseInterval = {
  month: 11,
  year: 2022,
  items: []
}

describe("Form", () => {
  // when a monthly category is present
  it("maps the categories as categoryOptions", () => {
    const category = { ...baseCategory }
    const targetItem = baseTargetItem({ category })
    const targetInterval = { ...baseTargetInterval, targetItems: [targetItem] }
    const baseInterval = { ...baseBaseInterval }
    const { categories, categoryOptions } = Form({ categories: [category], targetInterval, baseInterval })
    const expectedOptions = [{ value: category.id, label: category.name, isMonthly: category.isMonthly }]
    expect(categoryOptions).toEqual(expectedOptions)
    expect (categories).toEqual([category])
  })

  // when a weekly category is present and a targetItem exists
  it("does not map the categories", () => {
    const category = { ...baseCategory, isMonthly: false }
    const targetItem = baseTargetItem({ category })
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const baseInterval = { ...baseBaseInterval }
    const { categories, categoryOptions } = Form({ categories: [category], targetInterval, baseInterval })
    expect(categoryOptions).toEqual([])
    expect (categories).toEqual([category])
  })

  // when a weekly category is present and no targetItem exists
  it("does not map the categories", () => {
    const category = { ...baseCategory, isMonthly: false }
    const targetInterval = { ...baseTargetInterval, items: [] }
    const baseInterval = { ...baseBaseInterval }
    const { categories, categoryOptions } = Form({ categories: [category], targetInterval, baseInterval })
    const expectedOptions = [{ value: category.id, label: category.name, isMonthly: category.isMonthly }]
    expect(categoryOptions).toEqual(expectedOptions)
    expect (categories).toEqual([category])
  })

  it("returns some defaults", () => {
    const groceries = { ...baseCategory, id: "420" }
    const income = { ...baseCategory, id: "710" }
    const rent = { ...baseCategory, id: "28" }
    const targetItem1 = baseTargetItem( { category: groceries })
    const targetItem2 = baseTargetItem({ category: income, amount: 200000 })
    const baseItem = baseBaseItem({ category: rent })
    const targetInterval = { ...baseTargetInterval, items: [targetItem1, targetItem2] }
    const baseInterval = { ...baseBaseInterval }
    const {
      removedItems,
      selectedCategory,
      targetMonth,
      targetYear,
    } = Form({ categories: [groceries, rent], targetInterval, baseInterval })
    expect(selectedCategory).toEqual({ budgetCategoryId: null, displayAmount: "" })
    expect(removedItems).toEqual([])
    expect(targetMonth).toEqual(targetInterval.month)
    expect(targetYear).toEqual(targetInterval.year)
  })

  it("maps existing items and creates an item adjust forms", () => {
    const groceries = { ...baseCategory, id: "440" }
    const income = { ...baseCategory, id: "24" }
    const rent = { ...baseCategory, id: "840" }
    const targetItem1 = baseTargetItem({ category: groceries })
    const targetItem2 = baseTargetItem({ category: income, amount: 200000 })
    const baseItem = baseBaseItem({ category: rent })
    const targetInterval = { ...baseTargetInterval, items: [targetItem1, targetItem2] }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const { existingItems } = Form({ categories: [groceries, rent, income], targetInterval, baseInterval })
    const expected = [
      {
        ...targetItem1,
        data: {},
        displayAmount: MoneyFormatter(targetItem1.amount),
        isChanged: false,
      },
      {
        ...targetItem2,
        data: {},
        displayAmount: MoneyFormatter(targetItem2.amount),
        isChanged: false,
      }
    ]
    expect(existingItems).toEqual(expected)
  })

  // when the category is day-to-day and a base and target items exists
  it("does not create another form for the item create", () => {
    const groceries = { ...baseCategory, id: "440" }
    const targetItem = baseTargetItem({ category: groceries })
    const baseItem = baseBaseItem({ category: groceries })
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const { newItems } = Form({ categories: [groceries], targetInterval, baseInterval })
    expect(newItems).toEqual([])
  })

  it("maps base items and creates an item create forms", () => {
    const targetInterval = { ...baseTargetInterval, items: [] }
    const rent = { ...baseCategory, id: "808", isMonthly: true, isExpense: true }
    const income = { ...baseCategory, id: "57", isExpense: false, isMonthly: true }
    const baseItem1 = baseBaseItem({ category: rent })
    const baseItem2 = baseBaseItem({ category: income })
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2]  }
    const expected = [
      expect.objectContaining({
        ...baseItem1,
        amount: 0,
        data: {},
        defaultAmount: rent.defaultAmount,
        displayAmount: "",
        radioStatus: null,
      }),
      expect.objectContaining({
        ...baseItem2,
        amount: 0,
        data: {},
        defaultAmount: income.defaultAmount,
        displayAmount: "",
        radioStatus: null,
      }),
    ]
    const { newItems } = Form({ categories: [rent, income], targetInterval, baseInterval })
    expect(newItems).toEqual(expected)
  })

  // when the items are accruals
  it("maps base items and creates an item create forms", () => {
    const targetInterval = { ...baseTargetInterval, items: [] }
    const rent = { ...baseCategory, id: "808", isMonthly: true, isExpense: true, isAccrual: true }
    const income = { ...baseCategory, id: "57", isExpense: false, isMonthly: true, isAccrual: true }
    const baseItem1 = baseBaseItem({ category: rent })
    const baseItem2 = baseBaseItem({ category: income })
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2]  }
    const expected = [
      expect.objectContaining({
        ...baseItem1,
        amount: rent.defaultAmount,
        data: {},
        defaultAmount: rent.defaultAmount,
        displayAmount: MoneyFormatter(rent.defaultAmount),
        radioStatus: "default",
      }),
      expect.objectContaining({
        ...baseItem2,
        amount: income.defaultAmount,
        data: {},
        defaultAmount: income.defaultAmount,
        displayAmount: MoneyFormatter(income.defaultAmount),
        radioStatus: "default",
      }),
    ]
    const { newItems } = Form({ categories: [rent, income], targetInterval, baseInterval })
    expect(newItems).toEqual(expected)
  })
});
