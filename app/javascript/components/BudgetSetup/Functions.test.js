import { v4 as uuid } from "uuid";
import { asOption } from "../../lib/Functions";
import { decimalToInt } from "../../lib/MoneyFormatter";
// import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { reducer, eventsReducer } from "./Functions"

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

const baseCategory = {
  id: "442",
  defaultAmount: -2400,
  name: "Groceries, etc",
  iconClassName: "fa-fa-fa",
  isAccrual: false,
  isMonthly: false,
  isExpense: true,
}

const baseNewItem = ({ category, ...overrides }) => ({
  id: uuid(),
  name: category.name,
  budgeted: -1280,
  iconClassName: "fa-fa-fa",
  spent: -2299,
  ...overrides,
  budgetCategoryId: category.id,
  iconClassName: category.iconClassName,
  isAccrual: category.isAccrual,
  isExpense: category.isExpense,
  isMonthly: category.isMonthly,
  amount: 0,
  data: {},
  defaultAmount: category.defaultAmount,
  displayAmount: "",
  radioStatus: null,
})

const baseExistingItem = ({ category, ...overrides }) => ({
  id: "8898",
  name: category.name,
  amount: -1000,
  data: {},
  displayAmount: "-10.00",
  iconClassName: "fa-fa-fa",
  isChanged: false,
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
      isChanged: true,
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
    const { id, ...expected } = {
      ...baseNewItem({ category, spent: 0, budgeted: 0 }),
      amount: decimalToInt(displayAmount),
      displayAmount,
    }
    expect(actual.newItems[0]).toEqual(expect.objectContaining(expected))
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
    const { id, ...expected } = {
      ...baseNewItem({ category, spent: 0, budgeted: 0 }),
      ...payload,
      displayAmount,
      amount: decimalToInt(displayAmount),
    }
    expect(actual.newItems[0]).toEqual(expect.objectContaining(expected))
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
    const newItem = { ...baseNewItem({ category }) }
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
    const existingItem = { ...baseExistingItem({ category, isChanged: false }) }
    const form = { ...baseForm, existingItems: [existingItem] }
    const actual = eventsReducer(form)
    expect(actual.length).toEqual(0)
  })

  // when an altered existing item is  present
  it("includes an item adjust event form for that item", () => {
    const category = { ...baseCategory }
    const existingItem = { ...baseExistingItem({ category, isChanged: true }) }
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
