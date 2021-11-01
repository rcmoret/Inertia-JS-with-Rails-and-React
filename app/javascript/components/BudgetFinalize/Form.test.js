import Form from "./Form"

describe("Form", () => {
  // categories get mapped
  it("mappes the categories", () => {
    const expense = {
      id: '22',
      name: 'Budget Category',
      isExpense: true,
      isMonthly: true,
    }
    const props = {
      categories: [expense],
      baseInterval: {
        discretionary: 0,
        items: [],
      },
      targetInterval: {
        month: 1,
        year: 2021,
      }
    }
    const expected = [{ ...expense, label: expense.name, value: expense.id }]
    const actual = Form(props).categories
    expect(actual).toEqual(expected)
  })

  it("sorts the categories", () => {
    const expense = {
      id: '22',
      name: 'Some Expense Category',
      isExpense: true,
      isMonthly: true,
    }
    const revenue = {
      id: '122',
      name: 'A Nice Revenue',
      isExpense: true,
      isMonthly: true,
    }
    const props = {
      categories: [expense, revenue],
      baseInterval: {
        discretionary: 0,
        items: [],
      },
      targetInterval: {
        month: 1,
        year: 2021,
      }
    }
    const expected = ['A Nice Revenue', 'Some Expense Category']
    const actual = Form(props).categories.map(category => category.label)
    expect(actual).toEqual(expected)
  })

  // rollover item's discretionary times -1
  it("multiplies discretionary by -1", () => {
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [],
      },
      targetInterval: {
        month: 1,
        year: 2021,
      }
    }
    const expected = -100
    const actual = Form(props).rolloverItem.amount
    expect(actual).toEqual(expected)
  })

  // rollover item's month is from target interval
  it("sets the rollover item month", () => {
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [],
      },
      targetInterval: {
        month: 1,
        year: 2021,
      }
    }
    const expected = props.targetInterval.month
    const actual = Form(props).rolloverItem.month
    expect(actual).toEqual(expected)
  })
  // rollover item's year is from target interval
  it("sets the rollover item year", () => {
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [],
      },
      targetInterval: {
        month: 1,
        year: 2021,
      }
    }
    const expected = props.targetInterval.year
    const actual = Form(props).rolloverItem.year
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/o a matching item -- ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: true,
      isExpense: true,
      isMonthly: true
    }
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: [],
      }
    }
    const expected = {
      ...item,
      budgeted: 0,
      displayAmount: '-42.50',
      extra: 0,
      itemStatus: 'rolloverAll',
      eventAttributes: {
        amount: item.remaining,
        budgetCategoryId: item.budgetCategoryId,
        eventType: 'rollover_item_create',
        data: {},
        month: props.targetInterval.month,
        year: props.targetInterval.year,
      },
      rolloverAmount: item.remaining,
      targetItems:[
        {
          budgetItemId: null,
          amount: 0,
        }
      ],
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/o a matching item -- NON-ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: false,
      isExpense: true,
      isMonthly: true
    }
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: [],
      }
    }
    const expected = {
      ...item,
      budgeted: 0,
      displayAmount: '',
      extra: 0,
      itemStatus: '',
      eventAttributes: {
        amount: 0,
        budgetCategoryId: item.budgetCategoryId,
        eventType: 'rollover_item_create',
        data: {},
        month: props.targetInterval.month,
        year: props.targetInterval.year,
      },
      rolloverAmount: 0,
      targetItems:[
        {
          budgetItemId: null,
          amount: 0,
        }
      ],
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/ 1 matching item -- ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: true,
      isExpense: true,
      isMonthly: true
    }
    const targetItem = {
      budgetCategoryId: item.budgetCategoryId,
      budgetItemId: "4129",
      amount: -7700,
    }
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: [targetItem],
      }
    }
    const expected = {
      ...item,
      budgeted: targetItem.amount,
      displayAmount: '-42.50',
      extra: 0,
      itemStatus: 'rolloverAll',
      eventAttributes: {
        amount: (targetItem.amount + item.remaining),
        budgetItemId: targetItem.budgetItemId,
        eventType: 'rollover_item_adjust',
        data: { baseItemId: item.budgetItemId },
      },
      rolloverAmount: item.remaining,
      targetItems:[
        {
          budgetItemId: targetItem.budgetItemId,
          amount: targetItem.amount,
        }
      ],
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/ 1 matching item -- NON-ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: false,
      isExpense: true,
      isMonthly: true
    }
    const targetItem = {
      budgetCategoryId: item.budgetCategoryId,
      budgetItemId: "4129",
      amount: -7700,
    }
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: [targetItem],
      }
    }
    const expected = {
      ...item,
      budgeted: targetItem.amount,
      displayAmount: '',
      extra: 0,
      itemStatus: '',
      eventAttributes: {
        amount: targetItem.amount,
        budgetItemId: targetItem.budgetItemId,
        eventType: 'rollover_item_adjust',
        data: { baseItemId: item.budgetItemId },
      },
      rolloverAmount: 0,
      targetItems:[
        {
          budgetItemId: targetItem.budgetItemId,
          amount: targetItem.amount,
        }
      ],
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/ multiple matching items -- ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: true,
      isExpense: true,
      isMonthly: true
    }
    const targetItems = [
      {
        budgetCategoryId: item.budgetCategoryId,
        budgetItemId: "4129",
        amount: -7700,
      },
      {
        budgetCategoryId: item.budgetCategoryId,
        budgetItemId: "4219",
        amount: -7700,
      },
    ]
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: targetItems,
      }
    }
    const expected = {
      ...item,
      budgeted: 0,
      displayAmount: '-42.50',
      extra: 0,
      itemStatus: 'rolloverAll',
      eventAttributes: {
        amount: item.remaining,
        budgetItemId: null,
        eventType: 'rollover_item_adjust',
        data: { baseItemId: item.budgetItemId },
      },
      rolloverAmount: item.remaining,
      targetItems: targetItems.map(({budgetItemId, amount }) => ({ budgetItemId, amount })),
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })

  // reviewItems - an item w/ multiple matching items -- NON-ACCRUAL
  it("creates a rollover_item_create event", () => {
    const item = {
      budgetItemId: "5192",
      name: "Car Registration",
      budgetCategoryId: "109",
      amount: -5250,
      remaining: -4250,
      month: 11,
      year: 2021,
      iconClassName: "fas fa-car",
      isAccrual: false,
      isExpense: true,
      isMonthly: true
    }
    const targetItems = [
      {
        budgetCategoryId: item.budgetCategoryId,
        budgetItemId: "4129",
        amount: -7700,
      },
      {
        budgetCategoryId: item.budgetCategoryId,
        budgetItemId: "4219",
        amount: -7700,
      },
    ]
    const props = {
      categories: [],
      baseInterval: {
        discretionary: 100,
        items: [item],
      },
      targetInterval: {
        month: 1,
        year: 2021,
        items: targetItems,
      }
    }
    const expected = {
      ...item,
      budgeted: 0,
      displayAmount: '',
      extra: 0,
      itemStatus: '',
      eventAttributes: {
        amount: 0,
        budgetItemId: null,
        eventType: 'rollover_item_adjust',
        data: { baseItemId: item.budgetItemId },
      },
      rolloverAmount: 0,
      targetItems: targetItems.map(({budgetItemId, amount }) => ({ budgetItemId, amount })),
    }
    const actual = Form(props).reviewItems[0]
    expect(actual).toEqual(expected)
  })
});

//
// baseInterval.items => reviewItems
// * at least one day to day expense, one monthly revenue, etc.
// * at least one "non-reviewable"
//
// balances => leverage the reducer; no need for extensive tests
//
// assert basic rolloverItem / rolloverItemName are present
