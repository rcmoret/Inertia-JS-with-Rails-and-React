import reducer, { extraBalanceReducer } from "./FinalizeReducer"

// when event is "updateRolloverAmount"
it("returns an updated item/collection when updating rollover amount", () => {
  const state = {
    categories: [],
    reviewItems: [
      {
        budgetItemId: '88',
        budgeted: -1000,
        displayAmount: '',
        eventAttributes: {
          amount: 0,
          data: {},
        },
        name: 'Expense 22',
        remaining: -999,
        rolloverAmount: 0,
      }
    ],
    rolloverItem: { data: {} },
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
  const payload = { budgetItemId: '88', displayAmount: '-9', rolloverAmount: -900 }
  const actual = reducer("updateRolloverAmount", state, payload)
  const expected = {
    categories: [],
    reviewItems: [
      {
        budgetItemId: '88',
        budgeted: -1000,
        displayAmount: '-9',
        eventAttributes: {
          amount: -1900,
        },
        extra: -99,
        itemStatus: 'rolloverPartial',
        name: 'Expense 22',
        remaining: -999,
        rolloverAmount: -900,
      }
    ],
    rolloverItem: {
      amount: -99,
      data: {
        '88': { extra: -99, name: 'Expense 22' }
      }
    },
    discretionary: 0,
    extraBalance: -99,
    totalExtra: -99,
  }
  expect(actual).toEqual(expected)
});

// when event is "updateRolloverItem"
it("returns an updated item/collection when updating rollover item", () => {
  const data = { '88': { extra: -99, name: 'Expense 22' } }
  const state = {
    categories: [],
    reviewItems: [],
    rolloverItem: { data },
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
  const payload = { name: 'Groceries', budgetCategoryId: '77' }
  const actual = reducer("updateRolloverItem", state, payload)
  const expected = {
    categories: [],
    reviewItems: [],
    rolloverItemName: payload.name,
    rolloverItem: {
      budgetCategoryId: payload.budgetCategoryId,
      data
    },
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
  expect(actual).toEqual(expected)
});

// when the event is "updateSelectedItem"
it("returns an updated item", () => {
  const state = {
    categories: [],
    reviewItems: [
      {
        budgetItemId: '97',
        budgeted: 0,
        displayAmount: '',
        eventAttributes: {
          amount: 0,
          data: {},
        },
        name: 'Expense 22',
        remaining: -999,
        rolloverAmount: 0,
        targetItems: [
          {
            budgetItemId: '19',
            amount: -2000,
          }
        ]
      },
    ],
    rolloverItem: {},
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
  const payload = { budgetItemId: '97', id: '19' }
  const actual = reducer("updateSelectedItem", state, payload)
  const expected = {
    categories: [],
    reviewItems: [
      {
        budgetItemId: '97',
        budgeted: -2000,
        displayAmount: '',
        eventAttributes: {
          amount: 0,
          budgetItemId: payload.id,
          data: {},
        },
        name: 'Expense 22',
        remaining: -999,
        rolloverAmount: 0,
        targetItems: [
          {
            budgetItemId: '19',
            amount: -2000,
          }
        ]
      },
    ],
    rolloverItem: {},
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
});

// when event is not present in the switch statement
it("returns an updated item/collection when updating rollover amount", () => {
  const state = {
    categories: [],
    reviewItems: [
      {
        budgetItemId: '88',
        budgeted: -1000,
        displayAmount: '',
        eventAttributes: {
          amount: 0,
          data: {},
        },
        name: 'Expense 22',
        remaining: -999,
        rolloverAmount: 0,
      }
    ],
    rolloverItem: { data: {} },
    discretionary: 0,
    extraBalance: 0,
    totalExtra: 0,
  }
  const payload = { budgetItemId: '97', id: '19' }
  const actual = reducer("unknownEvent", state, payload)
  expect(actual).toEqual(state)
});

// extraBalanceReducer - test this directly
