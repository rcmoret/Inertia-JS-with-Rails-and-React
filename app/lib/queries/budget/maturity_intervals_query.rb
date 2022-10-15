# frozen_string_literal: true

module Queries
  module Budget
    class MaturityIntervalsQuery
      include Shared

      ALIASED_BUDGET_INTERVALS = BUDGET_INTERVALS.dup.alias('mi')
      ALIASED_JOIN = ALIASED_BUDGET_INTERVALS[:id].eq(BUDGET_CATEGORY_MATURITY_INTERVALS[:budget_interval_id])

      def initialize(month:, year:, user_id:)
        @month = month
        @year = year
        @user_id = user_id
      end

      def call
        ApplicationRecord.connection.exec_query(query.to_sql).reduce(ResultCollection.new) do |collection, result|
          collection << result
        end
      end

      private

      def query
        BUDGET_CATEGORY_MATURITY_INTERVALS
          .project(BUDGET_CATEGORY_MATURITY_INTERVALS[:budget_category_id], maturity_date)
          .join(ALIASED_BUDGET_INTERVALS)
          .on(ALIASED_BUDGET_INTERVALS[:id].eq(BUDGET_CATEGORY_MATURITY_INTERVALS[:budget_interval_id]))
          .where(where_clause)
          .group(BUDGET_CATEGORY_MATURITY_INTERVALS[:budget_category_id])
      end

      def where_clause
        ALIASED_BUDGET_INTERVALS[:year]
          .gt(year)
          .or(ALIASED_BUDGET_INTERVALS[:year].eq(year).and(ALIASED_BUDGET_INTERVALS[:month].gteq(month)))
      end

      def maturity_date
        SQLFunctions.minimum(
          SQLFunctions.sql_to_date(
            SQLFunctions.concat(
              SQLFunctions.cast(ALIASED_BUDGET_INTERVALS[:year], as: 'varchar'),
              SQLFunctions.lpad(SQLFunctions.cast(ALIASED_BUDGET_INTERVALS[:month], as: 'varchar'), 2, 0)
            ), 'YYYYMM'
          )
        ).as('maturity_date')
      end

      attr_reader :month, :year, :user_id

      class ResultCollection
        def initialize(*); end

        def <<(result)
          array << QueryResult.new(result)
          self
        end

        def fetch(key)
          array.find { |result| result.key == key } || { month: nil, year: nil }
        end

        delegate :empty?, to: :array

        private

        def array
          @array ||= []
        end
      end

      class QueryResult
        def initialize(result_hash)
          @key = result_hash.fetch('budget_category_id')
          result_hash.fetch('maturity_date').to_date.then do |maturity_date|
            @month = maturity_date.month
            @year = maturity_date.year
          end
        end

        attr_reader :key, :month, :year

        def to_hash
          { month: month, year: year }
        end
      end
    end
  end
end
