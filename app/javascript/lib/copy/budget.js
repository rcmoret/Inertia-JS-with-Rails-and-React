export const shared = {
  budgeted: "budgeted",
  currencySymbol: "$",
  deposited: "deposited",
  default: "default",
  difference: "difference",
  discretionary: "discretionary",
  items: "items",
  newAmount: "new amount",
  remaining: "remaining",
  selectCategory: "select category",
  spent: "spent",
  total: "total",
}

export const titles = {
  accruals: "accruals",
  dayToDay: "day-to-day",
  expenses: "expenses",
  monthly: "monthly",
  revenues: "revenues",
}

export const finalize = {
  all: "all",
  appliedToExtra: "Applied to Extra:",
  applyTo: "apply to",
  docTitle: (dateString) => `Finalize ${dateString}`,
  extraFromItems: "extra from items",
  finalize: "finalize",
  none: "none",
  partial: "partial",
  submitText: "Finalize and Rollover",
  totalToward: "total toward",
}

export const setup = {
  addItemText: "add item",
  docTitle: (dateString) => `set up ${dateString}`,
  existingItem: "exising item",
  newItem: "new item",
  submitText: "create budget",
}

export const index = {
  dayToDay: `${titles.dayToDay} ${shared.items}`,
  cleared: "cleared",
  dateRange: (first, last) => `${first} to ${last}`,
  daysRemaining: (num) => `days remaining: ${num}`,
  detailsTitle: "budget item details",
  hideAccruals: "hide accruals",
  hideClearedMonthly: "hide cleared monthly",
  hideData: "hide data",
  hideTransactions: "hide transactions",
  id: "id",
  monthly: `${titles.monthly} ${shared.items}`,
  overBudget: "over budget",
  remaining: "remaining",
  showAccruals: "show accruals",
  showClearedMonthly: "show cleared monthly",
  showData: "show data",
  showTransactions: "show transactions",
  spent: "spent",
  title: (dateString) => `Budget for ${dateString}`,
  totalDays: (num) => `total days: ${num}`,
  underBudget: "under budget",
}
