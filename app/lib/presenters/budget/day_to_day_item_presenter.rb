# frozen_string_literal: true

module Presenters
  module Budget
    class DayToDayItemPresenter < BaseItemPresenter
      def remaining
        if expense?
          [difference, 0].min
        else
          [difference, 0].max
        end
      end
    end
  end
end
