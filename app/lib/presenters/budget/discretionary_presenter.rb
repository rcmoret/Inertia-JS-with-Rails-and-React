# frozen_string_literal: true

module Presenters
  module Budget
    class DiscretionaryPresenter
      def initialize(budget_interval)
        @budget_interval = budget_interval
      end

      attr_reader :budget_interval

      delegate :available_cash, :current?, :date_range, :items, to: :budget_interval

      def amount
        items.reduce(available_cash) { |sum, item| sum + item.remaining }
      end

      def over_under_budget
        items.reduce(0) { |sum, item| sum + item.budget_impact }
      end

      def transaction_details
        @transaction_details ||=
          Transaction::DetailView
          .discretionary
          .budget_inclusions
          .non_transfers
          .between(date_range, include_pending: current?)
      end

      def transactions_total
        transaction_details.total.to_i
      end
    end
  end
end
