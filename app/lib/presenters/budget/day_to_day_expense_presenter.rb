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
    end
  end
end

