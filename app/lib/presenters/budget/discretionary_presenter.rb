# frozen_string_literal: true

module Presenters
  module Budget
    class DiscretionaryPresenter
      def initialize(budget_interval_presenter)
        @budget_interval_presenter = budget_interval_presenter
      end

      attr_reader :budget_interval_presenter

      delegate :available_cash, :current?, :date_range, :items, :user, to: :budget_interval_presenter

      def amount
        items.reduce(available_cash) { |sum, item| sum + item.remaining }
      end

      def over_under_budget
        items.reduce(0) { |sum, item| sum + item.budget_impact }
      end

      def transaction_details
        @transaction_details ||= Queries::Transactions::DiscretionaryDetailsQuery.new(interval: self).call
      end

      def transactions_total
        transaction_details.reduce(0) { |sum, detail| sum + detail.amount }
      end
    end
  end
end
