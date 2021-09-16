# frozen_string_literal: true

module Budget
  class ItemView < ActiveRecord::Base
    include Budget::Shared

    self.primary_key = :id

    def to_hash
      super
      attributes.symbolize_keys
    end

    def to_json(*)
      to_hash.to_json
    end

    def readonly?
      true
    end
  end
end
