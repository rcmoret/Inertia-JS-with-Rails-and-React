# frozen_string_literal: true

module Types
  module Budget
    class NamespaceType < BaseObject
      field :categories, [Budget::CategoryType], null: false do
        description 'Budget Categories available'
      end

      field :category, Budget::CategoryType, null: false do
        description 'Budget Category by id'
        argument :id, Integer, required: true
      end

      field :interval, Budget::IntervalType, null: false do
        description 'Budget Interval (month/year)'
        argument :month, Integer, required: false
        argument :year, Integer, required: false
      end

      field :item, Budget::ItemType, null: false do
        description 'Budget Item and related data'
        argument :id, Integer, required: true
      end
    end
  end
end
