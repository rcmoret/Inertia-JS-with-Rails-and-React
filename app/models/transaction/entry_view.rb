# frozen_string_literal: true

module Transaction
  class EntryView < ApplicationRecord
    include Scopes
    include Presentable

    self.table_name = :transaction_view
    self.primary_key = :id

    belongs_to :account, required: false
    belongs_to :transfer, required: false

    def readonly?
      true
    end

    def to_hash
      attributes.deep_symbolize_keys
    end

    def receipt_blob
      return if receipt_blob_id.nil?

      @receipt_blob ||= ActiveStorage::Blob.find(receipt_blob_id)
    end

    def presenter_class
      Presenters::Transactions::EntryPresenter
    end
  end
end
