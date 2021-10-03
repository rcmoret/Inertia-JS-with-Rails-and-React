# frozen_string_literal: true

module Presenters
  module Budget
    class MonthlyItemPresenter < BaseItemPresenter
      def remaining
        if transaction_count == 0
          amount
        else
          0
        end
      end
    end
  end
end
