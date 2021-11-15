import { v4 as uuid } from "uuid";
import { asOption } from "../../lib/Functions";
import Form, { reducer, eventsReducer } from "./Form"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

const baseCategory = {
  id: "442",
  defaultAmount: -2400,
  name: "Groceries, etc",
  iconClassName: "fa-fa-fa",
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

const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
      month,
      year,
    } = Form({ categories: [groceries, rent], targetInterval, baseInterval })
    expect(selectedCategory).toEqual({ budgetCategoryId: null, displayAmount: "" })
    expect(removedItems).toEqual([])
    expect(month).toEqual(targetInterval.month)
    expect(year).toEqual(targetInterval.year)
  })

  // when a monthly accrual item is present as base item and target item
  it("does not add a new item for that category", () => {
    const category = { ...baseCategory, name: "Car Registration", isAccrual: true, isMonthly: true }
    const targetItem = baseTargetItem({ category })
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const baseItem = baseBaseItem({ category: category })
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const { newItems, existingItems } = Form({ categories: [category], targetInterval, baseInterval })
    expect(newItems.length).toEqual(0)
    expect(existingItems.length).toEqual(1)
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
        originalAmount: targetItem1.amount,
      },
      {
        ...targetItem2,
        data: {},
        displayAmount: MoneyFormatter(targetItem2.amount),
        originalAmount: targetItem2.amount,
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
        status: null,
      }),
      expect.objectContaining({
        ...baseItem2,
        amount: 0,
        data: {},
        defaultAmount: income.defaultAmount,
        displayAmount: "",
        status: null,
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
        status: "default",
      }),
      expect.objectContaining({
        ...baseItem2,
        amount: income.defaultAmount,
        data: {},
        defaultAmount: income.defaultAmount,
        displayAmount: MoneyFormatter(income.defaultAmount),
        status: "default",
      }),
    ]
    const { newItems } = Form({ categories: [rent, income], targetInterval, baseInterval })
    expect(newItems).toEqual(expected)
  })
});

const baseForm = {
  existingItems: [],
  newItems: [],
  removedItems: [],
  categoryOptions: [],
  categories: [],
  selectedCategory: { budgetCategoryId: null, displayAmount: "" },
  targetMonth: 12,
  targetYear: 2022,
}

const baseNewItem = ({ category, ...overrides }) => ({
  id: uuid(),
  name: category.name,
  budgeted: -1280,
  iconClassName: "fa-fa-fa",
  spent: -2299,
  amount: 0,
  ...overrides,
  budgetCategoryId: category.id,
  iconClassName: category.iconClassName,
  isAccrual: category.isAccrual,
  isExpense: category.isExpense,
  isMonthly: category.isMonthly,
  data: {},
  defaultAmount: category.defaultAmount,
  displayAmount: "",
  status: null,
})

const baseExistingItem = ({ category, ...overrides }) => ({
  id: "8898",
  name: category.name,
  amount: -1000,
  data: {},
  displayAmount: "-10.00",
  iconClassName: "fa-fa-fa",
  originalAmount: -1000,
  ...overrides,
  budgetCategoryId: category.id,
  isAccrual: category.isAccrual,
  isExpense: category.isExpense,
  isMonthly: category.isMonthly,
})

describe("reducer", () => {
  it("adjusts a new item when adjustNewItem is the event", () => {
    const category = { ...baseCategory }
    const newItem = { ...baseNewItem({ category }) }
    const form = { ...baseForm, catgories: [category], newItems: [newItem] }
    const payload = { displayAmount: "-22.00", id: newItem.id }
    const actual = reducer("adjustNewItem", form, payload)
    const expected = {
      ...newItem,
      ...payload,
      amount: decimalToInt(payload.displayAmount),
    }
    expect(actual.newItems[0]).toEqual(expected)
  })

  it("adjusts an existing item when adjustExistingItem", () => {
    const category = { ...baseCategory }
    const existingItem = { ...baseExistingItem({ category }) }
    const form = { ...baseForm, categories: [category], existingItems: [existingItem] }
    const payload = { id: existingItem.id, displayAmount: "-66.77" }
    const actual = reducer("adjustExistingItem", form, payload)
    const expected = {
      ...existingItem,
      ...payload,
      amount: decimalToInt(payload.displayAmount),
    }
    expect(actual.existingItems[0]).toEqual(expected)
  })

  // when the item is monthly
  it("adds a new item when event is addItem", () => {
    const category = { ...baseCategory, isMonthly: true }
    const categoryOption = asOption(category)
    const displayAmount = "-100.30"
    const form = {
      ...baseForm,
      categories: [category],
      categoryOptions: [categoryOption],
      selectedCategory: { budgetCategoryId: category.id, displayAmount }
    }
    const payload = { budgetCategoryId: category.id }
    const actual = reducer("addItem", form, payload)
    const { id, data, ...expected } = {
      ...baseNewItem({ category, spent: 0, budgeted: 0 }),
      amount: decimalToInt(displayAmount),
      displayAmount,
    }
    expect(actual.newItems[0]).toEqual(expect.objectContaining(expected))
    expect(actual.newItems[0].id).toMatch(uuidRegexp)
    expect(actual.newItems[0].data.uuid).toMatch(uuidRegexp)
    expect(actual.categoryOptions).toEqual([categoryOption])
  })

  // when the item is day-to-day
  it("adds a new item when event is addItem", () => {
    const category = { ...baseCategory, isMonthly: false }
    const categoryOption = asOption(category)
    const displayAmount = "-100.30"
    const form = {
      ...baseForm,
      categories: [category],
      categoryOptions: [categoryOption],
      selectedCategory: { budgetCategoryId: category.id, displayAmount }
    }
    const payload = { budgetCategoryId: category.id }
    const actual = reducer("addItem", form, payload)
    const { id, data, ...expected } = {
      ...baseNewItem({ category, spent: 0, budgeted: 0 }),
      ...payload,
      displayAmount,
      amount: decimalToInt(displayAmount),
    }
    expect(actual.newItems[0]).toEqual(expect.objectContaining(expected))
    expect(actual.newItems[0].id).toMatch(uuidRegexp)
    expect(actual.newItems[0].data.uuid).toMatch(uuidRegexp)
    expect(actual.categoryOptions).toEqual([])
  })

  it("updates the selecteCategory when categorySelectUpdate", () => {
    const category = { ...baseCategory, isMonthly: false }
    const categoryOption = asOption(category)
    const form = { ...baseForm, categories: [category], categoryOptions: [categoryOption] }
    const payload = { budgetCategoryId: category.id }
    const actual = reducer("categorySelectUpdate", form, payload)
    expect(actual.selectedCategory.budgetCategoryId).toEqual(payload.budgetCategoryId)
  })


  it("updates the selecteCategory displayAmount when categorySelectUpdate", () => {
    const category = { ...baseCategory, isMonthly: false }
    const categoryOption = asOption(category)
    const form = { ...baseForm, categories: [category], categoryOptions: [categoryOption] }
    const payload = { displayAmount: "-30.34" }
    const actual = reducer("categorySelectUpdate", form, payload)
    expect(actual.selectedCategory.displayAmount).toEqual(payload.displayAmount)
  })

  it("returns the form when an unknown event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const categoryOption = asOption(category)
    const form = { ...baseForm, categories: [category], categoryOptions: [categoryOption] }
    const payload = { budgetCategoryId: category.id }
    const actual = reducer("noMatchingEvent", form, payload)
    expect(actual).toEqual(form)
  })

  // when removing an existing item
  it("addes the item's id to the list of removedItems", () => {
    const category = { ...baseCategory }
    const existingItem = { ...baseExistingItem({ category }) }
    const form = { ...baseForm, categories: [category], existingItems: [existingItem] }
    const payload = { id: existingItem.id }
    const actual = reducer("removeItem", form, payload)
    expect(actual.removedItems[0]).toEqual(expect.objectContaining(payload))
    expect(actual.existingItems).toEqual([])
  })

  // when removing a new item
  it("addes the item's id to the list of removedItems", () => {
    const category = { ...baseCategory }
    const newItem = { ...baseNewItem({ category }) }
    const form = { ...baseForm, catgories: [category], newItems: [newItem] }
    const payload = { id: newItem.id }
    const actual = reducer("removeItem", form, payload)
    expect(actual.newItems).toEqual([])
  })
});

describe("eventsReducer", () => {
  // when new items are present
  it("creates new item event payloads", () => {
    const category = { ...baseCategory }
    const newItem = { ...baseNewItem({ category, amount: -2349 }) }
    const month = 2
    const year = 2021
    const form = { ...baseForm, newItems: [newItem], month, year }
    const actual = eventsReducer(form)
    expect(actual.length).toEqual(1)
    expect(actual[0]).toEqual({
      month,
      year,
      eventType: "setup_item_create",
      amount: newItem.amount,
      budgetCategoryId: newItem.budgetCategoryId,
      data: null,
    })
  })

  // when an unchanged existing item is  present
  it("does not include an event form for that item", () => {
    const category = { ...baseCategory }
    const originalAmount = -13124
    const existingItem = { ...baseExistingItem({ category, amount: originalAmount, originalAmount }) }
    const form = { ...baseForm, existingItems: [existingItem] }
    const actual = eventsReducer(form)
    expect(actual.length).toEqual(0)
  })

  // when an altered existing item is  present
  it("includes an item adjust event form for that item", () => {
    const category = { ...baseCategory }
    const originalAmount = -13124
    const existingItem = { ...baseExistingItem({ category, amount: (originalAmount - 100), originalAmount }) }
    const form = { ...baseForm, existingItems: [existingItem] }
    const actual = eventsReducer(form)
    expect(actual.length).toEqual(1)
    expect(actual[0]).toEqual({
      budgetItemId: existingItem.id,
      amount: existingItem.amount,
      eventType: "setup_item_adjust",
      data: null,
    })
  });

  // when an existing item was removed
  it("includes a delete item event for that item", () => {
    const removedItem = { id: '777' }
    const form = { ...baseForm, removedItems: [removedItem] }
    const actual = eventsReducer(form)
    expect(actual.length).toEqual(1)
    expect(actual[0]).toEqual({
      budgetItemId: removedItem.id,
      eventType: "setup_item_delete",
      data: null,
    })
  })
});
