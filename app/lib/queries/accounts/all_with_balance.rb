# frozen_string_literal: true

module Queries
  module Accounts
    class AllWithBalance
      include Shared

      SELECTS = ACCOUNT_WITH_TRANSACTIONS_SELECTS

      def initialize(user:, include_archived: false)
        @user_group_id = user.user_group_id
        @include_archived = include_archived
      end

      def call(&block)
        if block_given?
          results.map(&block)
        else
          results
        end
      end

      private

      attr_reader :user_group_id, :include_archived

      def results
        @results ||= ApplicationRecord.connection.exec_query(query.to_sql).map do |result|
          QueryResult.new(result)
        end
      end

      def query
        ACCOUNT_WITH_TRANSACTIONS
          .dup
          .project(*SELECTS.values)
          .where(where_clause)
          .group(ACCOUNTS[:id])
      end

      def where_clause
        if include_archived
          user_group_clause
        else
          user_group_clause.and(exclude_inactive_clause)
        end
      end

      def exclude_inactive_clause
        ACCOUNTS[:archived_at].eq(nil)
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
