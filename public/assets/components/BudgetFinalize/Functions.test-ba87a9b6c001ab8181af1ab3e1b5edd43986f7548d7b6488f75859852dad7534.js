import Form from "./Form"
import { isSubmittable, reducer, formReducer } from "./Functions"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter"

import { baseCategory, baseBaseInterval, baseBaseItem, baseTargetInterval } from "./Form.test"

import { Inertia } from "@inertiajs/inertia";

jest.mock("@inertiajs/inertia")

describe("isSubmittable", () => {
  // when a base item has a null status
  it("returns false", () => {
    const form = {
      models: [
        { baseItems: [{ status: null, targetItemId: "22" }] },
      ],
      rolloverItem: { budgetCategoryId: "66" },
    }
    expect(isSubmittable(form)).toBe(false)
  })

  // when a base item has a null targetItemId
  it("returns false", () => {
    const form = {
      models: [
        { baseItems: [{ status: "rolloverPartial", targetItemId: null }] },
      ],
      rolloverItem: { budgetCategoryId: "66" },
    }
    expect(isSubmittable(form)).toBe(false)
  })

  // when the rollover item has a null budget category id
  it("returns false", () => {
    const form = {
      models: [
        { baseItems: [{ status: "rolloverPartial", targetItemId: "91" }] },
      ],
      rolloverItem: { budgetCategoryId: null },
    }
    expect(isSubmittable(form)).toBe(false)
  })

  // when a base item has both target item id and status and the rollover item has a category id
  it("returns true", () => {
    const form = {
      rolloverItem: { budgetCategoryId: "66" },
      models: [
        { baseItems: [{ status: "rolloverPartial", targetItemId: "91" }] },
      ],
    }
    expect(isSubmittable(form)).toBe(true)
  })
});

describe("formReducer", () => {
  // when the model is day to day and no target item exists
  it("includes an item create event", () => {
    const baseItem = {
      budgetItemId: "1015",
      inputAmount: "-22.00",
      budgetCategoryId: "11",
      remaining: -2200,
      rolloverAmount: -2200,
      status: "rolloverAll",
      targetItemId: "531bea80-51ad-4274-83eb-cd75e3a54ada"
    }
    const model = {
      id: "11",
      name: "Groceries",
      iconClassName: "fa-buggy",
      isAccrual: true,
      isExpense: true,
      isMonthly: false,
      baseItems: [baseItem],
      targetItems: [
        {
          budgetItemId: "531bea80-51ad-4274-83eb-cd75e3a54ada",
          budgeted: 0,
          eventType: "rollover_item_create"
        }
      ]
    }
    const form = {
      availableCategories: [ { value: "11", label: "Groceries" } ],
      models: [model],
      month: 2,
      rolloverItem: {
        data: {},
        discretionary: -100,
        extraBalance: 0,
        budgetCategoryId: null
      },
      year: 2022
    }
    const actual = formReducer(form)
    const expected = {
      amount: baseItem.remaining,
      budgetCategoryId: model.id,
      data: JSON.stringify({ [baseItem.budgetItemId]: { amount: baseItem.rolloverAmount } }),
      eventType: "rollover_item_create",
      month: form.month,
      year: form.year,
    }
    expect(actual).toContainEqual(expected)
  })

  // when the model is day to day and a target item exists
  it("includes an item adjust event", () => {
    const baseItem = {
      budgetItemId: "1015",
      inputAmount: "-22.00",
      budgetCategoryId: "11",
      remaining: -2200,
      rolloverAmount: -2200,
      status: "rolloverAll",
      targetItemId: "5515"
    }
    const targetItem = {
      budgetItemId: "5515",
      budgeted: -1000,
      eventType: "rollover_item_adjust",
    }
    const form = {
      availableCategories: [],
      models: [
        {
          id: "11",
          name: "Groceries",
          iconClassName: "fa-buggy",
          isAccrual: true,
          isExpense: true,
          isMonthly: false,
          baseItems: [baseItem],
          targetItems: [targetItem]
        }
      ],
      month: 2,
      rolloverItem: {
        data: {},
        discretionary: -100,
        extraBalance: 0,
        budgetCategoryId: null
      },
      year: 2022
    }
    const actual = formReducer(form)
    const expected = {
      amount: (baseItem.remaining + targetItem.budgeted),
      budgetItemId: targetItem.budgetItemId,
      data: JSON.stringify({ [baseItem.budgetItemId]: { amount: baseItem.rolloverAmount } }),
      eventType: targetItem.eventType,
    }
    expect(actual).toContainEqual(expected)
  })

  // when the model contains two base items both pointing to the same target item
  it("returns a single target item with the correct attributes", () => {
    const targetItem = {
      budgetItemId: "662",
      budgeted: -1000,
      eventType: "rollover_item_adjust",
    }
    const baseItem1 = {
      budgetItemId: "1015",
      inputAmount: "-22.00",
      budgetCategoryId: "11",
      remaining: -2200,
      rolloverAmount: -2200,
      status: "rolloverAll",
      targetItemId: targetItem.budgetItemId,
    }
    const baseItem2 = {
      ...baseItem1,
      budgetItemId: "1051",
      inputAmount: "-15.00",
      remaining: -7200,
      rolloverAmount: -1500,
      status: "rolloverPartial",
      targetItemId: targetItem.budgetItemId,
    }
    const form = {
      models: [
        {
          id: "11",
          name: "Groceries",
          iconClassName: "fa-buggy",
          isAccrual: true,
          isExpense: true,
          isMonthly: false,
          baseItems: [baseItem1, baseItem2],
          targetItems: [targetItem],
        }
      ],
      month: 2,
      rolloverItem: {
        data: {},
        discretionary: -100,
        extraBalance: 0,
        budgetCategoryId: "73",
      },
      year: 2022,
    }
    const actual = formReducer(form)[0]
    const expected = {
      amount: (targetItem.budgeted + baseItem1.rolloverAmount + baseItem2.rolloverAmount),
      budgetItemId: targetItem.budgetItemId,
      data: JSON.stringify({
        [baseItem1.budgetItemId]: { amount: baseItem1.rolloverAmount },
        [baseItem2.budgetItemId]: { amount: baseItem2.rolloverAmount },
      }),
      eventType: targetItem.eventType,
    }
    expect(actual).toEqual(expected)
  })

  // when the model is day to day and a target item exists
  it("includes an item create event", () => {
    const baseItem = {
      budgetItemId: "1015",
      inputAmount: "-22.00",
      budgetCategoryId: "11",
      remaining: -2200,
      rolloverAmount: -2200,
      status: "rolloverAll",
      targetItemId: "5515"
    }
    const targetItem = {
      budgetItemId: "5515",
      budgeted: -1000,
      eventType: "rollover_item_adjust",
    }
    const form = {
      availableCategories: [],
      models: [
        {
          id: "11",
          name: "Groceries",
          iconClassName: "fa-buggy",
          isAccrual: true,
          isExpense: true,
          isMonthly: false,
          baseItems: [baseItem],
          targetItems: [targetItem]
        }
      ],
      month: 2,
      rolloverItem: {
        data: {},
        discretionary: -100,
        extraBalance: 0,
        budgetCategoryId: null
      },
      year: 2022
    }
    const actual = formReducer(form)
    const expected = {
      amount: (baseItem.remaining + targetItem.budgeted),
      budgetItemId: targetItem.budgetItemId,
      data: JSON.stringify({ [baseItem.budgetItemId]: { amount: baseItem.rolloverAmount } }),
      eventType: "rollover_item_adjust",
    }
    expect(actual[0]).toEqual(expected)
  })

  // when the model is day to day and a target item exists
  it("includes an item create event for the rollover item", () => {
    const rolloverItem ={
      data: {
        "242": { amount: -2020 },
      },
      discretionary: -1040,
      extraBalance: -2020,
      budgetCategoryId: "573",
    }
    const form = {
      availableCategories: [],
      models: [],
      month: 2,
      rolloverItem,
      year: 2022
    }
    const actual = formReducer(form)[0]
    const expected = {
      amount: (rolloverItem.discretionary + rolloverItem.extraBalance),
      budgetCategoryId: rolloverItem.budgetCategoryId,
      data: JSON.stringify(rolloverItem.data),
      eventType: "rollover_item_create",
      month: form.month,
      year: form.year,
    }
    expect(actual).toEqual(expected)
  })
});
