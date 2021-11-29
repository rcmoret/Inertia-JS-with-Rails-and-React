# frozen_string_literal: true

module Presenters
  module Budget
    class DayToDayRevenuePresenter < BaseItemPresenter
      def remaining
        [difference, 0].max
      end

      def reviewable?
        remaining.positive?
      end

      def budget_impact
        if remaining.positive?
          0
        else
          difference * -1
        end
      end
    end
  end
end
