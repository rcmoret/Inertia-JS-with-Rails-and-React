# frozen_string_literal: true

module Types
  module Budget
    class DiscretionaryType < BaseObject
      field :amount, Integer, 'Total remaining in the budget', null: false
      field :over_under_budget, Integer, 'Sum of items that over over or under budget', null: false
      field :transaction_details,
            [Transactions::DetailType],
            'Transactions that are not associated with a budget item',
            null: false
      field :transactions_total, Integer, 'Total spent/deposited without an associated budget item', null: false
    end
  end
end
