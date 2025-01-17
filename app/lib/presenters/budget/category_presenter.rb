# frozen_string_literal: true

module Presenters
  module Budget
    class CategoryPresenter < SimpleDelegator
      def statistics(beginning_interval:, ending_interval:)
        Queries::Budget::CategoryStatistics.new(
          budget_category: self,
          beginning_interval: beginning_interval,
          ending_interval: ending_interval
        ).call
      end

      def accrual?
        super
      end
      alias is_accrual accrual?

      def expense?
        super
      end
      alias is_expense expense?

      def monthly?
        super
      end
      alias is_monthly monthly?

      def weekly?
        super
      end
      alias is_day_to_day weekly?

      def archived?
        super
      end
      alias is_archived archived?

      def per_diem_enabled?
        super
      end
      alias is_per_diem_enabled per_diem_enabled?
    end
  end
end
