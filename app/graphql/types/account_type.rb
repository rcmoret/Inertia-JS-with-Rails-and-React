# frozen_string_literal: true

module Types
  class AccountType < BaseObject
    field :id, ID, 'Primary key', null: false
    field :name, String, 'Account name', null: false
    field :slug, String, 'Account slug name', null: false
    field :balance, Integer, 'Total of accounts transactions', null: false
    field :balance, Integer, 'Sum of the transaction details', null: false
    field :balance_prior_to, Integer, null: false do
      description 'Sum of the transaction details prior to a date'
      argument :month, Integer, required: true
      argument :year, Integer, required: true
    end
    field :priority, Integer, 'Display order', null: false
    field :transactions, [Transactions::EntryType], null: false do
      description 'Transactions associated with the account'
      argument :month, Integer, required: false
      argument :year, Integer, required: false
    end
  end
end
