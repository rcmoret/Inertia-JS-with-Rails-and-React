import Form, { reducer } from "./Form";
import { asOption, generateIdentifier } from "../../lib/Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

export const baseCategory = {
  id: "11",
  name: "Groceries",
  slug: "groceries",
  iconClassName: "fa-buggy",
  isAccrual: false,
  isExpense: true,
  isMonthly: false
}

export const baseBaseInterval = {
  discretionary: { amount: 100 },
  items: [],
}

export const baseBaseItem = {
  inputAmount: "",
  budgetCategoryId: "44",
  remaining: -3300,
  rolloverAmount: null,
  status: null,
}

export const baseTargetInterval = {
  month: 2,
  year: 2022,
  items: [],
}

describe("Form", () => {
  // when the category is day to day & target event is an item create (no available items)
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    const { targetItemId, ...expectedBaseItem } = baseItem
    expect(actual.baseItems).toEqual([expect.objectContaining(expectedBaseItem)])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0, eventType: "rollover_item_create" }))
  })

  // when the category is monthly there are multiple base items & no available target items
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem1 = { ...baseBaseItem, budgetCategoryId: category.id, key: generateIdentifier() }
    const baseItem2 = { ...baseBaseItem, budgetCategoryId: category.id, budgetItemId: "808", key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    expect(actual.baseItems).toEqual([{ ...baseItem1, targetItemKey: null }, { ...baseItem2, targetItemKey: null }])
    expect(actual.targetItems.length).toEqual(2)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0, eventType: "rollover_item_create" }))
    expect(actual.targetItems[1]).toEqual(expect.objectContaining({ budgeted: 0, eventType: "rollover_item_create" }))
  })

  // when the category is day to day and the target event is available
  it("maps the base items as part of a model object maps a target event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetItemId: "5515", budgetCategoryId: category.id, budgeted: -1000, key: generateIdentifier() }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining(category))
    expect(actual.baseItems[0]).toEqual({ ...baseItem, targetItemKey: targetItem.key })
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual({
      budgetItemKey: targetItem.key,
      budgeted: targetItem.budgeted,
      eventType: "rollover_item_adjust",
      isNew: false,
      name: `${targetItem.key} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`,
    })
  })

  // when the category is day to day, an accural & target event is an item create (no available items)
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: false, isAccrual: true }
    const baseItem = {
      ...baseBaseItem,
      key: generateIdentifier(),
      budgetCategoryId: category.id,
      rolloverAmount: baseBaseItem.remaining,
    }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    const { targetItemId, ...expectedBaseItem } = baseItem
    expect(actual.baseItems).toEqual([
      expect.objectContaining({
        ...expectedBaseItem,
        inputAmount: MoneyFormatter(baseItem.remaining),
        status: "rolloverAll",
      })
    ])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0 }))
  })

  // when the category is day to day, an accrual and the target event is available
  it("maps the base items as part of a model object maps a target event", () => {
    const category = { ...baseCategory, isMonthly: false, isAccrual: true }
    const baseItem = {
      ...baseBaseItem,
      key: generateIdentifier(),
      budgetCategoryId: category.id,
      rolloverAmount: baseBaseItem.remaining
    }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetItemId: "5515", budgetCategoryId: category.id, budgeted: -1000, key: generateIdentifier() }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    const { targetItemId, ...expectedBaseItem } = baseItem
    expect(actual.baseItems).toEqual([
      expect.objectContaining({
        ...expectedBaseItem,
        inputAmount: MoneyFormatter(baseItem.remaining),
        status: "rolloverAll",
        targetItemKey: targetItem.key,
      })
    ])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual({
      budgetItemKey: targetItem.key,
      budgeted: targetItem.budgeted,
      eventType: "rollover_item_adjust",
      isNew: false,
      name: `${targetItem.key} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`,
    })
  })

  // when the category is monthly & target event is an item create (no available items)
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    const { targetItemId, ...expectedBaseItem } = baseItem
    expect(actual.baseItems).toEqual([expect.objectContaining(expectedBaseItem)])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0 }))
  })

  // when the category is monthly and the target event is available
  it("maps the base items as part of a model object maps a target event", () => {
    const category = { ...baseCategory, isMonthly: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetCategoryId: category.id, budgeted: -1000, key: generateIdentifier() }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining(category))
    expect(actual.baseItems[0]).toEqual({ ...baseItem, targetItemKey: targetItem.key })
    expect(actual.targetItems.length).toEqual(2)
    expect(actual.targetItems).toEqual(expect.arrayContaining([
      {
        budgetItemKey: targetItem.key,
        isNew: false,
        budgeted: targetItem.budgeted,
        eventType: "rollover_item_adjust",
        name: `${targetItem.key} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`
      },
      expect.objectContaining({ budgeted: 0, eventType: "rollover_item_create", name: "New (0)" })
    ]))
  })

  // when no categories have target items
  it("returns those categories as select options", () => {
    const categories = [
      { ...baseCategory, isMonthly: false },
      { ...baseCategory, isMonthly: true, name: "Rent", id: "212" },
    ]
    const baseInterval = { ...baseBaseInterval }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories, baseInterval, targetInterval }
    const actual = Form(props).availableCategories
    const expected = categories.map(c => asOption(c))
    expect(actual).toEqual(expected)
  });

  // when some categories have target items and others do not
  it("returns those categories as select options", () => {
    const category1 = { ...baseCategory, isMonthly: false }
    const category2 = { ...baseCategory, isMonthly: true, name: "Rent", id: "212" }
    const categories = [category1, category2]
    const baseInterval = { ...baseBaseInterval }
    const targetItem = { budgetItemId: "5515", budgetCategoryId: category1.id, budgeted: -1000, key: generateIdentifier() }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories, baseInterval, targetInterval }
    const actual = Form(props).availableCategories
    const expected = [asOption(category2)]
    expect(actual).toEqual(expected)
  });

  // reviewItem - when no accurals are present
  it("returns 0 for the rollover amount, discretionary from baseInterval", () => {
    const category = { ...baseCategory, isMonthly: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const formObject = Form(props)
    const { rolloverItem } = formObject
    expect(rolloverItem.budgetCategoryId).toEqual(null)
    expect(rolloverItem.extraBalance).toEqual(0)
    expect(rolloverItem.discretionary).toEqual(baseInterval.discretionary.amount * -1)
  })

  // reviewItem - when accurals are present
  it("returns 0 for the rollover amount, discretionary from baseInterval", () => {
    const category1 = { ...baseCategory, isMonthly: true }
    const category2 = { ...baseCategory, isMonthly: true, isAccrual: true, id: "909" }
    const baseItem1 = { ...baseBaseItem, budgetCategoryId: category1.id, key: generateIdentifier() }
    const baseItem2 = { ...baseBaseItem, budgetCategoryId: category2.id, budgetItemId: "808", key: generateIdentifier() }
    const categories = [category1, category2]
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories, baseInterval, targetInterval }
    const { rolloverItem } = Form(props)
    expect(rolloverItem.budgetCategoryId).toEqual(null)
    expect(rolloverItem.extraBalance).toEqual(0)
    expect(rolloverItem.discretionary).toEqual(baseInterval.discretionary.amount * -1)
  })
});

describe("reducer", () => {
  // when event is "updateBudgetModel" and the amount is partial
  it("returns an updated item/collection when updating a partial rollover amount", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, remaining: -2200, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const form = Form(props)
    const payload = { budgetCategoryId: category.id,
      key: baseItem.key,
      inputAmount: "-12.00",
      targetItemId: "878",
    }
    const updatedForm = reducer("updateBudgetModel", form, payload)
    expect(updatedForm.models.length).toEqual(1)
    expect(updatedForm.models[0].baseItems.length).toEqual(1)
    const updatedItem = updatedForm.models[0].baseItems[0]
    expect(updatedItem.inputAmount).toEqual(payload.inputAmount)
    expect(updatedItem.rolloverAmount).toEqual(decimalToInt(payload.inputAmount))
    expect(updatedItem.status).toEqual("rolloverPartial")
    expect(updatedItem.targetItemId).toEqual(payload.targetItemId)
    const updatedRolloverItem = updatedForm.rolloverItem
    const expectedDataObject = {
      [baseItem.key]: {
        name: category.name,
        amount: (baseItem.remaining - decimalToInt(payload.inputAmount)),
      }
    }
    expect(updatedRolloverItem.data).toEqual(expect.objectContaining(expectedDataObject))
    expect(updatedRolloverItem.extraBalance).toEqual(baseItem.remaining - decimalToInt(payload.inputAmount))
  })

  // when event is "updateBudgetModel" and the amount is none (0.00)
  it("returns an updated item/collection when updating the base item and rollover item", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, remaining: -2200, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const form = Form(props)
    const payload = {
      budgetCategoryId: category.id,
      key: baseItem.key,
      inputAmount: "0.00",
      targetItemId: "878",
    }
    const updatedForm = reducer("updateBudgetModel", form, payload)
    expect(updatedForm.models.length).toEqual(1)
    expect(updatedForm.models[0].baseItems.length).toEqual(1)
    const updatedItem = updatedForm.models[0].baseItems[0]
    expect(updatedItem.inputAmount).toEqual(payload.inputAmount)
    expect(updatedItem.rolloverAmount).toEqual(0)
    expect(updatedItem.status).toEqual("rolloverNone")
    expect(updatedItem.targetItemId).toEqual(payload.targetItemId)
    const updatedRolloverItem = updatedForm.rolloverItem
    const expectedDataObject = {
      [baseItem.key]: {
        name: category.name,
        amount: baseItem.remaining,
      }
    }
    expect(updatedRolloverItem.data).toEqual(expect.objectContaining(expectedDataObject))
    expect(updatedRolloverItem.extraBalance).toEqual(baseItem.remaining - decimalToInt(payload.inputAmount))
  })

  it("returns an updated item/collection when updating the base item and rollover item", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, remaining: -2200, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const form = Form(props)
    const payload = {
      budgetCategoryId: category.id,
      key: baseItem.key,
      inputAmount: MoneyFormatter(baseItem.remaining),
      targetItemId: "878",
    }
    const updatedForm = reducer("updateBudgetModel", form, payload)
    expect(updatedForm.models.length).toEqual(1)
    expect(updatedForm.models[0].baseItems.length).toEqual(1)
    const updatedItem = updatedForm.models[0].baseItems[0]
    expect(updatedItem.inputAmount).toEqual(payload.inputAmount)
    expect(updatedItem.rolloverAmount).toEqual(baseItem.remaining)
    expect(updatedItem.status).toEqual("rolloverAll")
    expect(updatedItem.targetItemId).toEqual(payload.targetItemId)
    expect(updatedForm.rolloverItem.data).toEqual(form.rolloverItem.data)
    expect(updatedForm.rolloverItem.extraBalance).toEqual(baseItem.remaining - decimalToInt(payload.inputAmount))
  })

  it("removes the data from the rollover item if swithcing to rolloverAll", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, remaining: -2200, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const form = {
      ...Form(props),
      rolloverItem: {
        ...Form(props).rolloverItem,
        [baseItem.budgetItemId]: { name: category.name, amount: -200 },
        extraBalance: -1905,
      },
    }
    const payload = {
      budgetCategoryId: category.id,
      key: baseItem.key,
      inputAmount: MoneyFormatter(baseItem.remaining),
    }
    const updatedForm = reducer("updateBudgetModel", form, payload)
    expect(updatedForm.rolloverItem.data).toEqual({})
    expect(updatedForm.rolloverItem.extraBalance).toEqual(baseItem.remaining - decimalToInt(payload.inputAmount))
  })

  // when the event is updateRolloverItem
  it("returns an updated rollover item in the form", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, remaining: -2200, key: generateIdentifier() }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const form = Form(props)
    const payload = { budgetCategoryId: "981" }
    const actual = reducer("updateRolloverItem", form, payload)
    expect(actual.rolloverItem.budgetCategoryId).toEqual(payload.budgetCategoryId)
  })
});
