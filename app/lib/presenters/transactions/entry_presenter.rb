# frozen_string_literal: true

module Presenters
  module Transactions
    class EntryPresenter < SimpleDelegator
      def account_name
        attributes.fetch(:account_name) { super }
      end

      def details
        attributes.fetch(:details) { super }.map { |detail| Detail.new(detail) }
      end

      def amount
        details.map(&:amount).reduce(:+)
      end

      def receipt_blob
        return if super.nil?

        AttachmentBlobPresenter.new(super)
      end

      private

      def attributes
        @attributes ||= super.deep_symbolize_keys
      end

      Detail = Struct.new(
        :id,
        :budget_category_name,
        :budget_category_id,
        :budget_item_id,
        :amount,
        :icon_class_name,
        keyword_init: true,
      )
    end
  end
end
