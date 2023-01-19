# frozen_string_literal: true

module Types
  module Transactions
    class EntryType < BaseObject
      field :id, ID, 'Primary key of the transaction entry', null: false
      field :key, String, 'identifier', null: false
      field :account_id, ID, 'Primary key of the associated account', null: false
      field :amount, Integer, 'Sum of the details amounts', null: false
      field :budget_exclusion, Boolean, 'Should the transaction entry be excluded from budget calculations', null: false
      field :check_number, String, 'Old fashioned check number', null: true
      field :clearance_date, GraphQL::Types::ISO8601Date, 'When the bank cleared the tranaction', null: true
      field :description, String, 'Description of the transaction', null: true
      field :details, [DetailType], 'Amount and budget info', null: false
      field :notes, String, 'Extra information regarding the transaction', null: true
      field :receipt_blob, AttachmentBlobType, 'Receipt uploaded for the transaction', null: true
      field :transfer_id, ID, 'ID associated with a transfer', null: true
      field :updated_at, GraphQL::Types::ISO8601DateTime, 'Time the entry was last updated', null: false
    end
  end
end
