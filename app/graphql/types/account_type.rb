# frozen_string_literal: true

module Types
  class AccountType < BaseObject
    field :id, ID, 'Primary key', null: false
    field :name, String, 'Account name', null: false
    field :archived_at, GraphQL::Types::ISO8601DateTime, 'Time of archiving', null: true
    field :balance, Integer, 'Sum of the transaction details', null: false
    field :balance_prior_to, Integer, null: false do
      description 'Sum of the transaction details prior to a date'
      argument :month, Integer, required: true
      argument :year, Integer, required: true
      argument :user_id, Integer, required: true
    end
    field :is_archived, Boolean, 'Has the account been archived', null: false
    field :is_cash_flow, Boolean, 'Count toward available cash', null: false
    field :priority, Integer, 'Display order', null: false
    field :transactions, [Transactions::EntryType], null: false do
      description 'Transactions associated with the account'
      argument :month, Integer, required: false
      argument :year, Integer, required: false
      argument :user_id, Integer, required: true
    end
    field :slug, String, 'Account slug name', null: false
  end
end
