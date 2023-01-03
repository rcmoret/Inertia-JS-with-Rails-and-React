# frozen_string_literal: true

module Types
  module Budget
    class ItemEventType < BaseObject
      field :id, ID, 'primary key', null: false
      field :key, String, 'unique identifier', null: false
      field :type_description, String, 'Description of the event', null: false
      field :amount, Integer, 'Amount to change the total by', null: false
      field :data, String, 'JSON string with additional event information', null: true
      field :budget_item_id, ID, 'Foreign key to the parent budget item', null: false
      field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    end
  end
end
