# frozen_string_literal: true

module Queries
  module Accounts
    class AvailableCash
      include Shared

      SELECTS = BALANCE_SELECT

      def initialize(user_id, date_range:, current: true)
        @user_id = user_id
        @date_range = date_range
        @current = current
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
          CASH_FLOW_ACCOUNTS_CLAUSE.and(TRANSACTIONS[:clearance_date].lteq(date_range.last))
          .or(NON_CASH_FLOW_ACCOUNTS_CLAUSE.and(non_cash_flow_entry_clause))
        )
      end

      def non_cash_flow_entry_clause
        clause = TRANSACTIONS[:clearance_date].between(date_range)
        clause = clause.or(TRANSACTIONS[:clearance_date].eq(nil)) if current?
        clause
      end

      def base_clause
        user_clause.and(NON_ARCHIEVED_ACCOUNT_CLAUSE)
      end

      def current?
        @current == true
      end

      attr_reader :user_id, :date_range
    end
  end
end
