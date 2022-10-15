# frozen_string_literal: true

module Queries
  module Budget
    class TransactionDetailsQuery
      include Shared

      def initialize(month:, year:, user_id:)
        @month = month
        @year = year
        @user_id = user_id
      end

      def call
        results.reduce(ResultCollection.new) do |collection, result|
          collection << result
        end
      end

      private

      def results
        @results ||= ApplicationRecord.connection.exec_query(query.to_sql)
      end

      def query
        TRANSACTION_DETAILS
          .project(*selects)
          .join(BUDGET_ITEMS).on(DETAIL_ITEM_JOIN)
          .join(TRANSACTIONS).on(TRANSACTION_DETAILS_JOIN)
          .join(ACCOUNTS).on(ACCOUNT_TRANSACTIONS_JOIN)
          .join(BUDGET_INTERVALS).on(interval_join)
          .group(BUDGET_ITEMS[:id])
      end

      def selects
        [
          BUDGET_ITEMS[:id].as('budget_item_id'),
          TRANSACTION_DETAILS[:amount].sum.as('transactions_total'),
          TRANSACTION_DETAILS[Arel.star].count.as('transactions_count'),
          json_select.as('collection'),
        ]
      end

      def json_select
        SQLFunctions.sql_to_json(SQLFunctions.array_agg(json_object))
      end

      def json_object
        SQLFunctions.json_build_object(
          Arel::Nodes::Quoted.new('id'), TRANSACTION_DETAILS[:id],
          Arel::Nodes::Quoted.new('amount'), TRANSACTION_DETAILS[:amount],
          Arel::Nodes::Quoted.new('updated_at'), TRANSACTION_DETAILS[:updated_at],
          Arel::Nodes::Quoted.new('account_name'), ACCOUNTS[:name],
          Arel::Nodes::Quoted.new('clearance_date'), TRANSACTIONS[:clearance_date],
          Arel::Nodes::Quoted.new('description'), TRANSACTIONS[:description]
        )
      end

      attr_reader :month, :year, :user_id

      class NullQueryResult
        def initialize(*); end

        def transactions_total
          0
        end

        def transactions_count
          0
        end

        def collection
          []
        end
      end

      class QueryResult
        DETAIL_KEYS = %i[id amount updated_at account_name clearance_date description].freeze

        def initialize(result_hash)
          @budget_item_id = result_hash.fetch('budget_item_id')
          @transactions_total = result_hash.fetch('transactions_total')
          @transactions_count = result_hash.fetch('transactions_count')
          @collection = JSON.parse(result_hash.fetch('collection'), symbolize_names: true).map do |detail|
            Detail.new(*detail.values_at(*DETAIL_KEYS))
          end
        end

        attr_reader :budget_item_id, :collection, :transactions_count, :transactions_total

        Detail = Struct.new(*DETAIL_KEYS)
      end

      class ResultCollection
        def initialize(*); end

        def <<(result)
          array << QueryResult.new(result)
          self
        end

        def fetch(key)
          array.find { |result| result.budget_item_id == key } || NullQueryResult.new
        end

        private

        def array
          @array ||= []
        end
      end
    end
  end
end
