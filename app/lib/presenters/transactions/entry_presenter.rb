# frozen_string_literal: true

module Presenters
  module Transactions
    class EntryPresenter < SimpleDelegator
      def account_name
        attributes.fetch(:account_name) { super }
      end

      def details
        attributes.fetch(:details) { super }.then do |collection|
          collection.map { |detail| Detail.new(detail).as_presenter }
        end
      end

      def amount
        details.map(&:amount).reduce(:+)
      end

      private

      def attributes
        @attributes ||= super.deep_symbolize_keys
      end

      Detail = Struct.new(
        :id,
        :budget_category,
        :budget_item_id,
        :amount,
        :icon_class_name,
        keyword_init: true
      ) do
        def as_presenter
          DetailPresenter.new(self)
        end

        def category_name
          budget_category
        end
      end
    end
  end
end
