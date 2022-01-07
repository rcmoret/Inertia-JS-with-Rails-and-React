# frozen_string_literal: true

module Types
  module Budget
    class CategoryMaturityIntervalType < BaseObject
      field :id, ID, 'Primary key', null: false
      field :month, Integer, 'Month', null: false
      field :year, Integer, 'Year', null: false
    end
  end
end
