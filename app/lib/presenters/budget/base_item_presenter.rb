# frozen_string_literal: true

module Presenters
  module Budget
    class BaseItemPresenter < SimpleDelegator
      def accrual?
        accrual
      end
      alias is_accrual accrual?

      def monthly?
        monthly
      end
      alias is_monthly monthly?

      def expense?
        expense
      end
      alias is_expense expense?

      def per_diem_enabled?
        is_per_diem_enabled
      end

      def spent
        transactions_total
      end

      def transaction_detail_count
        transactions_count
      end

      def difference
        amount - spent
      end

      def deletable?
        transactions_count.zero?
      end
      alias is_deletable deletable?

      def maturity_month
        return unless accrual?

        upcoming_maturity_interval[:month]
      end

      def maturity_year
        return unless accrual?

        upcoming_maturity_interval[:year]
      end
    end
  end
end
