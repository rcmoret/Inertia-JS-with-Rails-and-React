# frozen_string_literal: true

module Transaction
  class EntryView < ApplicationRecord
    include Scopes
    self.table_name = :transaction_view
    self.primary_key = :id

    belongs_to :account, required: false
    belongs_to :transfer, required: false

    def readonly?
      true
    end

    def to_hash
      attributes
        .merge(details: details)
        .deep_symbolize_keys
    end
  end
end
