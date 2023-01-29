# frozen_string_literal: true

module Presenters
  module Budget
    class BaseItemPresenter < SimpleDelegator
      delegate :accrual?,
               :expense?,
               :is_per_diem_enabled,
               :maturity_intervals,
               :monthly?,
               :slug,
               to: :category
      delegate :month, :year, to: :interval

      alias is_accrual accrual?
      alias is_expense expense?
      alias is_monthly monthly?
      alias budget_category_slug slug

      def events
        @events ||= super.map(&:as_presenter)
      end

      def transaction_details
        @transaction_details ||= super.map(&:as_presenter)
      end

      def amount
        @amount ||= events.map(&:amount).sum
      end

      def spent
        @spent ||= transaction_details.map(&:amount).sum
      end

      def transaction_detail_count
        @transaction_detail_count ||= transaction_details.size
      end

      def difference
        @difference ||= amount - spent
      end

      def deletable?
        transaction_detail_count.zero?
      end
      alias is_deletable deletable?

      def maturity_month
        return unless accrual?

        upcoming_maturity_interval&.month
      end

      def maturity_year
        return unless accrual?

        upcoming_maturity_interval&.year
      end

      private

      def upcoming_maturity_interval
        @upcoming_maturity_interval ||= maturity_intervals.on_or_after(month, year).take
      end

      def item
        @item ||= __getobj__
      end
    end
  end
end
