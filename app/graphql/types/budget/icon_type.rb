# frozen_string_literal: true

module Types
  module Budget
    class IconType < BaseObject
      field :id, ID, 'Primary key', null: false
      field :name, String, 'Readable name', null: false
      field :class_name, String, 'Class name used by the front end', null: false
    end
  end
end
