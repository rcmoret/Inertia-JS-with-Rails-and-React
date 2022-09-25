# frozen_string_literal: true

module Types
  module Budget
    class ItemType < BaseObject
      field :key, ID, 'Unique identife for the budget item', null: false
      field :name, String, 'The category name of the budget item', null: false
      field :amount, Integer, 'The amount that was budgeted', null: false
      field :budget_category_id, ID, 'The primary key of the category', null: false
      field :budget_impact, Integer, 'Amount over/under budget', null: false
      field :difference, Integer, 'The difference between the amount spend and budgeted', null: false
      field :events, [ItemEventType], 'Events associated with the budget item', null: false
      field :icon_class_name, String, 'The icon class name for the item', null: true
      field :is_deletable, Boolean, 'Can this budget item be deleted base on transaction details', null: false
      field :is_accrual, Boolean, 'Is the item\'s category an accrual', null: false
      field :is_monthly, Boolean, 'Is the category a monthly/not day-to-day', null: false
      field :is_expense, Boolean, 'Is the category an expense/not revenue', null: false
      field :is_per_diem_enabled, Boolean, 'Should the per day amounts be displayed', null: false
      field :month, Integer, 'The month of the budget\'s interval', null: false
      field :maturity_month, Integer, 'The month of next maturity if accural', null: true
      field :maturity_year, Integer, 'The year of next maturity if accural', null: true
      field :remaining, Integer, 'The amount left counted in the budget', null: false
      field :transaction_detail_count, Integer, 'The number of transactions associated with the item', null: false
      field :transaction_details,
            [Transactions::DetailType],
            'The transaction details associated with this budget item',
            null: false
      field :spent, Integer, 'The total amount of transaction details', null: false
      field :year, Integer, 'The year of the budget\'s interval', null: false
    end
  end
end
