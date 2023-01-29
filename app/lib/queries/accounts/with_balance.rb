# frozen_string_literal: true

module Queries
  module Accounts
    class WithBalance
      include Shared

      SELECTS = ACCOUNT_WITH_TRANSACTIONS_SELECTS

      def initialize(user:, month:, year:)
        @user_id = user.user_group_id
        @interval = Budget::Interval.belonging_to(user).for(month: month, year: year)
      end

      def call
        results.first.fetch('balance')
      end

      private

      attr_reader :user_group_id, :interval

      def results
        @results ||= ApplicationRecord.connection.exec_query(query.to_sql)
      end

      def query
        ACCOUNT_WITH_TRANSACTIONS
          .dup
          .project(*SELECTS.values)
          .where(where_clause)
          .group(ACCOUNTS[:id])
      end

      def where_clause
        user_group_clause
          .and(ACCOUNTS[:id].eq(account_id))
          .and(transactions_clause)
      end

      def transactions_clause
        clause = TRANSCATIONS[:clearance_date].lt(interval.first_date)
        clause = clause.or(TRANSCATIONS[:clearance_date].eq(nil)) if interval.future?
        clause
      end

      def presenter_class
        Presenters::AccountPresenter
      end

      class QueryResult
        include Presentable

        def initialize(result_hash)
          SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", result_hash.fetch(attribute_name))
          end
        end

        attr_reader(*SELECTS.keys.map(&:to_sym))

        private

        def presenter_class
          Presenters::AccountPresenter
        end
      end

      private_constant :QueryResult
    end
  end
end
