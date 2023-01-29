# frozen_string_literal: true

module Presenters
  module Budget
    class MonthlyItemPresenter < BaseItemPresenter
      def remaining
        if transaction_detail_count.zero?
          amount
        else
          0
        end
      end

      def reviewable?
        deletable?
      end

      def budget_impact
        return 0 if transaction_detail_count.zero?

        difference * -1
      end
    end
  end
end
