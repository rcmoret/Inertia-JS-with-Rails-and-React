# frozen_string_literal: true

module Types
  module Budget
    class CategoryType < BaseObject
      field :id, ID, 'Primary key', null: false
      field :name, String, 'The category name', null: false
      field :default_amount, Integer, 'The default amount might be expected to be budgeted', null: false
      field :icon_class_name, String, 'The icon class name for the item', null: true
      field :is_accrual, Boolean, 'Is the item\'s category an accrual', null: false
      field :is_monthly, Boolean, 'Is the category a monthly/not day-to-day', null: false
      field :is_expense, Boolean, 'Is the category an expense/not revenue', null: false
    end
  end
end
