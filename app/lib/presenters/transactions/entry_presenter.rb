# frozen_string_literal: true

module Presenters
  module Transactions
    class EntryPresenter < SimpleDelegator
      def details
        super.map(&:as_presenter)
      end

      def amount
        details.map(&:amount).reduce(:+)
      end

      def receipt_blob
        return if receipt_attachment.nil?

        AttachmentBlobPresenter.new(super)
      end

      delegate :name, to: :account, prefix: true
      delegate :key, to: :transfer, allow_nil: true, prefix: true
    end
  end
end
