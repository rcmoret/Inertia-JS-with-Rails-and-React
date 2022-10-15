# frozen_string_literal: true

module Queries
  module Transactions
    class AccountTransactions
      include Shared

      ENTRY_SELECTS = Transaction::Entry.columns.reduce({}) do |hash, column|
        hash.merge(column.name => TRANSACTIONS[column.name.to_sym])
      end

      SELECTS = {
        **ENTRY_SELECTS,
      }.freeze

      SUBQUERY_SELECTS = DETAIL_SELECTS.merge(
        'budget_category_name' => BUDGET_CATEGORIES[:name].as('budget_category_name'),
        'budget_category_id' => BUDGET_CATEGORIES[:id].as('budget_category_id'),
        'icon_class_name' => ICONS[:class_name].as('icon_class_name')
      ).freeze

      def initialize(account_id:, date_range:, include_pending:)
        @account_id = account_id
        @date_range = date_range
        @include_pending = include_pending
      end

      def call
        ApplicationRecord.connection.exec_query(query.to_sql).map do |result|
          QueryResult.new(result)
        end
      end

      private

      def details_aggregate
        SQLFunctions.sql_to_json(SQLFunctions.array_agg(json_object)).as('details')
      end

      def json_object
        SQLFunctions.json_build_object(
          Arel::Nodes::Quoted.new('id'), subquery[:id],
          Arel::Nodes::Quoted.new('amount'), subquery[:amount],
          Arel::Nodes::Quoted.new('budget_item_id'), subquery[:budget_item_id],
          Arel::Nodes::Quoted.new('budget_category_id'), subquery[:budget_category_id],
          Arel::Nodes::Quoted.new('budget_category_name'), subquery[:budget_category_name],
          Arel::Nodes::Quoted.new('icon_class_name'), subquery[:icon_class_name]
        )
      end

      def query
        TRANSACTIONS
          .project(details_aggregate, *SELECTS.values)
          .join(subquery).on(subquery[:transaction_entry_id].eq(TRANSACTIONS[:id]))
          .group(TRANSACTIONS[:id])
      end

      def subquery
        TRANSACTION_DETAILS
          .project(*SUBQUERY_SELECTS.values)
          .join(TRANSACTIONS).on(TRANSACTIONS[:id].eq(TRANSACTION_DETAILS[:transaction_entry_id]))
          .join(BUDGET_ITEMS).on(DETAIL_ITEM_JOIN)
          .join(BUDGET_CATEGORIES).on(BUDGET_CATEGORY_JOIN)
          .join(ICONS, Arel::Nodes::OuterJoin).on(ICON_CATEGORY_JOIN)
          .where(subquery_where_clause)
          .as('details_subquery')
      end

      def subquery_where_clause
        primary_clause = TRANSACTIONS[:account_id].eq(account_id)

        secondary_clause = TRANSACTIONS[:clearance_date].between(date_range)

        secondary_clause = secondary_clause.or(TRANSACTIONS[:clearance_date].eq(nil)) if include_pending

        primary_clause.and(secondary_clause)
      end

      attr_reader :account_id, :date_range, :include_pending

      class QueryResult
        include Presentable

        DETAIL_ATTRS = %w[id amount budget_item_id budget_category_id budget_category_name icon_class_name].freeze

        def initialize(result_hash)
          SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", result_hash.fetch(attribute_name))
          end

          @details = JSON.parse(result_hash.fetch('details')).map do |hash|
            Detail.new(*hash.values_at(*DETAIL_ATTRS))
          end
        end

        def attributes
          SELECTS.keys.reduce({ details: details }) do |attrs, key|
            attrs.merge(key.to_sym => public_send(key))
          end
        end

        Detail = Struct.new(*DETAIL_ATTRS.map(&:to_sym))
        attr_reader(:details, *SELECTS.keys.map(&:to_sym))

        private

        def presenter_class
          Presenters::Transactions::EntryPresenter
        end
      end

      private_constant :QueryResult
    end
  end
end
