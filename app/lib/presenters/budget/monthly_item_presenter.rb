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
    end
  end
end
