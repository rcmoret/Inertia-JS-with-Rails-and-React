import Form from "./Form";
import { asOption } from '../../lib/Functions';
import MoneyFormatter from '../../lib/MoneyFormatter';

export const baseCategory = {
  id: '11',
  name: 'Groceries',
  iconClassName: 'fa-buggy',
  isAccrual: false,
  isExpense: true,
  isMonthly: false
}

export const baseBaseInterval = {
  discretionary: 100,
  items: [],
}

export const baseBaseItem = {
  budgetItemId: '1015',
  inputAmount: '',
  budgetCategoryId: '44',
  remaining: -3300,
  rolloverAmount: null,
  status: null,
  targetItemId: null,
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
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0, eventType: 'rollover_item_create' }))
  })

  // when the category is monthly there are multiple base items & no available target items
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem1 = { ...baseBaseItem, budgetCategoryId: category.id }
    const baseItem2 = { ...baseBaseItem, budgetCategoryId: category.id, budgetItemId: '808' }
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    expect(actual).toEqual(expect.objectContaining({ baseItems: [baseItem1, baseItem2] }))
    expect(actual.targetItems.length).toEqual(2)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0, eventType: 'rollover_item_create' }))
    expect(actual.targetItems[1]).toEqual(expect.objectContaining({ budgeted: 0, eventType: 'rollover_item_create' }))
  })

  // when the category is day to day and the target event is available
  it("maps the base items as part of a model object maps a target event", () => {
    const category = { ...baseCategory, isMonthly: false }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetItemId: '5515', budgetCategoryId: category.id, budgeted: -1000 }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    expect(actual.baseItems[0]).toEqual({ ...baseItem, targetItemId: targetItem.budgetItemId })
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual({
      budgetItemId: targetItem.budgetItemId,
      budgeted: targetItem.budgeted,
      eventType: 'rollover_item_adjust',
      name: `${targetItem.budgetItemId} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`,
    })
  })

  // when the category is day to day, an accural & target event is an item create (no available items)
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: false, isAccrual: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, rolloverAmount: baseBaseItem.remaining }
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
        status: 'rolloverAll',
      })
    ])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual(expect.objectContaining({ budgeted: 0 }))
  })

  // when the category is day to day, an accrual and the target event is available
  it("maps the base items as part of a model object maps a target event", () => {
    const category = { ...baseCategory, isMonthly: false, isAccrual: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id, rolloverAmount: baseBaseItem.remaining }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetItemId: '5515', budgetCategoryId: category.id, budgeted: -1000 }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    const { targetItemId, ...expectedBaseItem } = baseItem
    expect(actual.baseItems).toEqual([
      expect.objectContaining({
        ...expectedBaseItem,
        inputAmount: MoneyFormatter(baseItem.remaining),
        status: 'rolloverAll',
      })
    ])
    expect(actual.targetItems.length).toEqual(1)
    expect(actual.targetItems[0]).toEqual({
      budgetItemId: targetItem.budgetItemId,
      budgeted: targetItem.budgeted,
      eventType: 'rollover_item_adjust',
      name: `${targetItem.budgetItemId} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`,
    })
  })

  // when the category is monthly & target event is an item create (no available items)
  it("maps the base items as part of a model object adds a target event", () => {
    const category = { ...baseCategory, isMonthly: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id }
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
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetItem = { budgetItemId: '5515', budgetCategoryId: category.id, budgeted: -1000 }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories: [category], baseInterval, targetInterval }
    const actual = Form(props).models.find(model => model.id === category.id)
    expect(actual).toEqual(expect.objectContaining({ ...category }))
    expect(actual.baseItems[0]).toEqual({ ...baseItem, targetItemId: targetItem.budgetItemId })
    expect(actual.targetItems.length).toEqual(2)
    expect(actual.targetItems).toEqual(expect.arrayContaining([
      {
        budgetItemId: targetItem.budgetItemId,
        budgeted: targetItem.budgeted,
        eventType: 'rollover_item_adjust',
        name: `${targetItem.budgetItemId} - ${MoneyFormatter(targetItem.budgeted, { decorate: true })}`
      },
      expect.objectContaining({ budgeted: 0, eventType: 'rollover_item_create', name: 'New (0)' })
    ]))
  })

  // when no categories have target items
  it("returns those categories as select options", () => {
    const categories = [
      { ...baseCategory, isMonthly: false },
      { ...baseCategory, isMonthly: true, name: 'Rent', id: '212' },
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
    const category2 = { ...baseCategory, isMonthly: true, name: 'Rent', id: '212' }
    const categories = [category1, category2]
    const baseInterval = { ...baseBaseInterval }
    const targetItem = { budgetItemId: '5515', budgetCategoryId: category1.id, budgeted: -1000 }
    const targetInterval = { ...baseTargetInterval, items: [targetItem] }
    const props = { categories, baseInterval, targetInterval }
    const actual = Form(props).availableCategories
    const expected = [asOption(category2)]
    expect(actual).toEqual(expected)
  });

  // reviewItem - when no accurals are present
  it("returns 0 for the rollover amount, discretionary from baseInterval", () => {
    const category = { ...baseCategory, isMonthly: true }
    const baseItem = { ...baseBaseItem, budgetCategoryId: category.id }
    const baseInterval = { ...baseBaseInterval, items: [baseItem] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories: [category], baseInterval, targetInterval }
    const { rolloverItem } = Form(props)
    expect(rolloverItem.budgetCategoryId).toEqual(null)
    expect(rolloverItem.extraBalance).toEqual(0)
    expect(rolloverItem.discretionary).toEqual(baseInterval.discretionary * -1)
  })

  // reviewItem - when accurals are present
  it("returns 0 for the rollover amount, discretionary from baseInterval", () => {
    const category1 = { ...baseCategory, isMonthly: true }
    const category2 = { ...baseCategory, isMonthly: true, isAccrual: true, id: '909' }
    const baseItem1 = { ...baseBaseItem, budgetCategoryId: category1.id }
    const baseItem2 = { ...baseBaseItem, budgetCategoryId: category2.id, budgetItemId: '808' }
    const categories = [category1, category2]
    const baseInterval = { ...baseBaseInterval, items: [baseItem1, baseItem2] }
    const targetInterval = { ...baseTargetInterval }
    const props = { categories, baseInterval, targetInterval }
    const { rolloverItem } = Form(props)
    expect(rolloverItem.budgetCategoryId).toEqual(null)
    expect(rolloverItem.extraBalance).toEqual(0)
    expect(rolloverItem.discretionary).toEqual(baseInterval.discretionary * -1)
  })
});
