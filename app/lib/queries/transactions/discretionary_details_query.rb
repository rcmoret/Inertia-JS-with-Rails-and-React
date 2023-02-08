# frozen_string_literal: true

module Queries
  module Transactions
    class DiscretionaryDetailsQuery
      include Shared

      SELECTS = {
        'key' => TRANSACTION_DETAILS[:key],
        'amount' => TRANSACTION_DETAILS[:amount],
        'updated_at' => TRANSACTION_DETAILS[:updated_at],
        'account_name' => ACCOUNTS[:name].as('account_name'),
        'clearance_date' => TRANSACTIONS[:clearance_date],
        'description' => TRANSACTIONS[:description],
      }.freeze

      def initialize(interval:)
        @interval = interval
      end

      def call
        results.map { |result| QueryResult.new(result) }
      end

      private

      def results
        @results ||= ApplicationRecord.connection.exec_query(query.to_sql)
      end

      def query
        TRANSACTION_DETAILS
          .project(*SELECTS.values)
          .join(TRANSACTIONS).on(TRANSACTION_DETAILS_JOIN)
          .join(TRANSFERS, Arel::Nodes::OuterJoin).on(TRANSFER_JOIN)
          .join(ACCOUNTS).on(ACCOUNT_TRANSACTIONS_JOIN)
          .where(where_clause)
      end

      def where_clause
        base_clause = TRANSACTION_DETAILS[:budget_item_id].eq(nil)
        base_clause = base_clause.and(TRANSACTIONS[:budget_exclusion].eq(false))
        base_clause = base_clause.and(TRANSFERS[:id].eq(nil))

        date_clause = TRANSACTIONS[:clearance_date].between(date_range)
        date_clause = date_clause.or(TRANSACTIONS[:clearance_date].eq(nil)) if current?

        base_clause.and(date_clause)
      end

      attr_reader :interval

      delegate :current?, :date_range, to: :interval

      class QueryResult
        def initialize(result_hash)
          SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", result_hash.fetch(attribute_name))
          end
        end

        attr_reader(*SELECTS.keys.map(&:to_sym))
      end
    end
  end
end
