# frozen_string_literal: true

module Types
  module Budget
    class CategoryType < BaseObject
      field :id, ID, 'Primary key', null: false
      field :name, String, 'The category name', null: false
      field :archived_at, GraphQL::Types::ISO8601DateTime, 'Time of archiving', null: true
      field :default_amount, Integer, 'The default amount might be expected to be budgeted', null: false
      field :icon_class_name, String, 'The icon class name for the item', null: true
      field :is_accrual, Boolean, 'Is the item\'s category an accrual', null: false
      field :is_archived, Boolean, 'Has the category been archived', null: false
      field :is_monthly, Boolean, 'Is the category a monthly/not day-to-day', null: false
      field :is_expense, Boolean, 'Is the category an expense/not revenue', null: false
      field :maturity_intervals, [CategoryMaturityIntervalType], 'Maturity info for accruals', null: false
      field :icon, IconType, 'Icon associated with the category', null: true
      field :slug, String, 'Short name for the URL', null: false
    end
  end
end
