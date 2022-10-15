# frozen_string_literal: true

module Queries
  module Accounts
    class AvailableCash
      include Shared

      SELECTS = BALANCE_SELECT

      def initialize(budget_interval:)
        @budget_interval = budget_interval.as_presenter
      end

      def call
        results.first.fetch('balance')
      end

      private

      def results
        @results ||= ApplicationRecord.connection.exec_query(query.to_sql)
      end

      def query
        ACCOUNT_WITH_TRANSACTIONS
          .dup
          .project(*SELECTS.values)
          .where(where_clause)
      end

      def where_clause
        base_clause.and(
          cash_flow_accounts_clause.or(NON_CASH_FLOW_ACCOUNTS_CLAUSE.and(non_cash_flow_entry_clause))
        )
      end

      def cash_flow_accounts_clause
        date_clause = TRANSACTIONS[:clearance_date].lteq(date_range.last)
        date_clause = date_clause.or(pending_clause) if current?

        CASH_FLOW_ACCOUNTS_CLAUSE.and(date_clause)
      end

      def non_cash_flow_entry_clause
        date_clause = TRANSACTIONS[:clearance_date].between(date_range)
        date_clause = date_clause.or(pending_clause) if current?
        TRANSACTIONS[:budget_exclusion].eq(false).and(date_clause)
      end

      def base_clause
        user_clause.and(NON_ARCHIVED_ACCOUNT_CLAUSE)
      end

      def pending_clause
        TRANSACTIONS[:clearance_date].eq(nil)
      end


      attr_reader :budget_interval

      delegate :user_id, :date_range, :current?, to: :budget_interval
    end
  end
end
