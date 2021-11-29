# frozen_string_literal: true

module Presenters
  module Budget
    class DayToDayExpensePresenter < BaseItemPresenter
      def remaining
        [difference, 0].min
      end

      def reviewable?
        remaining.negative?
      end

      def budget_impact
        if remaining.negative?
          0
        else
          difference * -1
        end
      end
    end
  end
end
