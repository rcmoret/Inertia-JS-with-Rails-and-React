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
    end
  end
end
