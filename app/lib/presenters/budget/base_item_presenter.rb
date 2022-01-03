# frozen_string_literal: true

module Presenters
  module Budget
    class BaseItemPresenter < SimpleDelegator
      def name
        attributes.fetch(:name) { category.name }
      end

      def amount
        attributes.fetch(:amount) { events.reduce(0) { |sum, event| sum + event.amount } }
      end

      def spent
        attributes.fetch(:spent) { transaction_details.reduce(0) { |sum, detail| sum + detail.amount } }
      end

      def icon_class_name
        attributes.fetch(:icon_class_name) { category.icon_class_name }
      end

      def accrual?
        attributes.fetch(:accrual) { category.accrual? }
      end
      alias is_accrual accrual?

      def month
        attributes.fetch(:month) { interval.month }
      end

      def year
        attributes.fetch(:year) { interval.year }
      end

      def monthly?
        attributes.fetch(:monthly) { category.monthly? }
      end
      alias is_monthly monthly?

      def expense?
        attributes.fetch(:expense) { category.expense? }
      end
      alias is_expense expense?

      def transaction_detail_count
        attributes.fetch(:transaction_count) { transation_details.count }
      end

      def difference
        amount - spent
      end

      def deletable?
        transaction_detail_count.zero?
      end
      alias is_deletable deletable?

      def events
        super.map(&:as_presenter)
      end

      def transaction_details
        transactions.map(&:as_presenter)
      end

      def maturity_month
        return unless accrual?

        category.maturity_intervals.on_or_after(month, year)&.first&.month
      end

      def maturity_year
        return unless accrual?

        category.maturity_intervals.on_or_after(month, year)&.first&.year
      end

      private

      def attributes
        super.symbolize_keys
      end
    end
  end
end
