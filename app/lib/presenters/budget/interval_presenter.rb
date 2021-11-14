# frozen_string_literal: true

module Presenters
  module Budget
    class IntervalPresenter < SimpleDelegator
      def accrual_items
        with_presenters { item_views.accruals }
      end

      def items(include_deleted: false, reviewable_only: false)
        items_query = item_views
        items_query = items_query.active unless include_deleted

        items_query.map(&:as_presenter).then do |item_presenters|
          item_presenters.select!(&:reviewable?) if reviewable_only

          item_presenters
        end
      end

      def discretionary
        Account.available_cash + items.map(&:remaining).reduce(:+)
      end

      # def transaction_entries(account_id:)
      #   Account.
      # end
    end
  end
end
