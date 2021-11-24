# frozen_string_literal: true

module Types
  module Budget
    class IntervalType < BaseObject
      field :month, Integer, 'Interval\'s month', null: false
      field :year, Integer, 'Interval\'s year', null: false
      field :is_set_up, Boolean, 'Has the interval\'s budget been set up', null: false
      field :is_closed_out, Boolean, 'Has the interval been closed at the end of the month?', null: false
      field :is_current, Boolean, 'Is it the current interval', null: false
      field :total_days, Integer, 'Total number of days in the interval', null: false
      field :days_remaining, Integer, 'Days remaining in the interval (total if not current)', null: false
      field :discretionary, Integer, 'The amount of cash plus the remaining budget items amounts', null: false
      field :items, [ItemType], 'budget items within the given interval', null: false do
        argument :include_deleted, Boolean, required: false
        argument :reviewable_only, Boolean, required: false
      end
      field :first_date, GraphQL::Types::ISO8601Date, 'Date the budget interval begins', null: false
      field :last_date, GraphQL::Types::ISO8601Date, 'Date the budget interval ends', null: false
      # field :transaction_entries, [TransactionEntryType], 'Transactions for the interval', null: false do
      #   argument :account_id, Integer, required: true
      # end
    end
  end
end
