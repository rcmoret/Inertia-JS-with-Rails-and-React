# frozen_string_literal: true

module Presenters
  module Budget
    class MonthlyItemPresenter < BaseItemPresenter
      def remaining
        if transaction_count.zero?
          amount
        else
          0
        end
      end

      def reviewable?
        deletable?
      end

      def budget_impact
        if transaction_count.zero?
          0
        else
          difference * -1
        end
      end
    end
  end
end
