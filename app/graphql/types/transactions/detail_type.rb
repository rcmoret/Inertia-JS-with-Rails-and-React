# frozen_string_literal: true

module Types
  module Transactions
    class DetailType < BaseObject
      field :id, ID, 'primary key', null: false
      field :entry_id, ID, 'primary key of the parent record', null: false
      field :account_id, ID, 'Primary key of the associated financial account', null: false
      field :account_name, String, 'Name of the associated financial account', null: false
      field :amount, Integer, 'Amount of money spent or deposited', null: false
      field :budget_exclusion,
            Boolean,
            'Should the transaction detail be excluded from budget calculations',
            null: false
      field :budget_item_key, String, 'Optional identifying key of the associated budget item', null: true
      field :budget_category_id, ID, 'Optional primary key of the associated budget category', null: true
      field :budget_category_name, String, 'Name of the associated budget category', null: true
      field :clearance_date, GraphQL::Types::ISO8601DateTime, 'Date when the transaction posted to the bank', null: true
      field :description, String, 'Description from the entry', null: true
      field :icon_class_name, String, 'Icon class name from the budget category', null: true
      field :notes, String, 'Additional information', null: true
      field :transfer_id, ID, 'Transaction entry id associated with this txn as a transfer', null: true
      field :updated_at, GraphQL::Types::ISO8601DateTime, 'When the detail was last updated', null: false
    end
  end
end
