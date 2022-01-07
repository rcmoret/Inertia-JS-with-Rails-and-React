# frozen_string_literal: true

module Types
  module Budget
    class NamespaceType < BaseObject
      field :categories, [CategoryType], null: false do
        description 'Budget Categories available'
        argument :include_archived, Boolean, required: false
      end

      field :category, CategoryType, null: false do
        description 'Budget Category by id'
        argument :id, Integer, required: true
      end

      field :icons, [IconType], 'Icons available', null: false

      field :interval, IntervalType, null: false do
        description 'Budget Interval (month/year)'
        argument :month, Integer, required: false
        argument :year, Integer, required: false
      end

      field :item, ItemType, null: false do
        description 'Budget Item and related data'
        argument :id, Integer, required: true
      end
    end
  end
end
