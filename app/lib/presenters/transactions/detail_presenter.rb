# frozen_string_literal: true

module Presenters
  module Transactions
    class DetailPresenter < SimpleDelegator
      delegate :account_name,
               :clearance_date,
               :description,
               to: :entry

      def budget_item_key
        budget_item&.key
      end

      def budget_category_id
        category&.id
      end

      def budget_category_name
        category&.name
      end

      def icon_class_name
        category&.icon&.class_name
      end

      private

      def category
        budget_item&.category
      end
    end
  end
end
