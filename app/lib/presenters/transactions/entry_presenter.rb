# frozen_string_literal: true

module Presenters
  module Transactions
    class EntryPresenter < SimpleDelegator
      def account_name
        attributes.fetch(:account_name) { super }
      end

      def details
        @details ||= super.map(&:as_presenter)
      end

      def amount
        details.map(&:amount).reduce(:+)
      end

      def receipt_blob
        return if receipt_attachment.nil?

        AttachmentBlobPresenter.new(super)
      end

      private

      def attributes
        @attributes ||= super.deep_symbolize_keys
      end
    end
  end
end
