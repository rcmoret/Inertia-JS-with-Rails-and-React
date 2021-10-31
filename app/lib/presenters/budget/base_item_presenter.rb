# frozen_string_literal: true

module Presenters
  module Budget
    class BaseItemPresenter < SimpleDelegator
      def name
        attributes.fetch(:name) { category.name }
      end

      def amount
        attributes.fetch(:amount) { super }
      end

      def spent
        attributes.fetch(:spent) { transaction_details.sum(:amount) }
      end

      def icon_class_name
        attributes.fetch(:icon_class_name) { category.icon_class_name }
      end

      def accrual?
        attributes.fetch(:accrual) { category.accrual? }
      end
      alias_method :is_accrual, :accrual?

      def month
        attributes.fetch(:month) { interval.month }
      end

      def year
        attributes.fetch(:year) { interval.year }
      end

      def monthly?
        attributes.fetch(:monthly?) { category.monthly? }
      end
      alias_method :is_monthly, :monthly?

      def expense?
        attributes.fetch(:expense?) { category.expense? }
      end
      alias_method :is_expense, :expense?

      def transaction_detail_count
        attributes.fetch(:transaction_count) { transation_details.count }
      end

      def difference
        amount - spent
      end

      def deletable?
        transaction_detail_count.zero?
      end
      alias_method :is_deletable, :deletable?

      private

      def attributes
        super.symbolize_keys
      end
    end
  end
end
