# frozen_string_literal: true

module Queries
  module Budget
    class IntervalItemsQuery
      include Shared

      CATEGORY_SELECTS = {
        'name' => BUDGET_CATEGORIES[:name].as('name'),
        'expense' => BUDGET_CATEGORIES[:expense].as('expense'),
        'monthly' => BUDGET_CATEGORIES[:monthly].as('monthly'),
        'accrual' => BUDGET_CATEGORIES[:accrual].as('accrual'),
        'is_per_diem_enabled' => BUDGET_CATEGORIES[:is_per_diem_enabled].as('is_per_diem_enabled'),
      }.freeze

      INTERVAL_SELECTS = {
        'month' => BUDGET_INTERVALS[:month].as('month'),
        'year' => BUDGET_INTERVALS[:year].as('year'),
      }.freeze

      ICON_SELECTS = {
        'icon_class_name' => ICONS[:class_name].as('icon_class_name'),
      }.freeze

      SELECTS = [
        ITEM_SELECTS,
        CATEGORY_SELECTS,
        INTERVAL_SELECTS,
        ICON_SELECTS,
      ].reduce(:merge).freeze

      def initialize(interval:, include_deleted:)
        @user_id = interval.user_id
        @month = interval.month
        @year = interval.year
        @include_deleted = include_deleted
      end

      def call
        ApplicationRecord.connection.exec_query(query.to_sql).map do |result|
          QueryResult.new(result)
        end
      end

      private

      def query
        BUDGET_ITEMS
          .project(*SELECTS.values)
          .join(BUDGET_INTERVALS).on(BUDGET_INTERVALS[:id].eq(BUDGET_ITEMS[:budget_interval_id]))
          .join(BUDGET_CATEGORIES).on(BUDGET_CATEGORY_JOIN)
          .join(ICONS, Arel::Nodes::OuterJoin).on(ICON_CATEGORY_JOIN)
          .where(where_clause)
      end

      def where_clause
        clause = BUDGET_INTERVALS[:month].eq(month).and(BUDGET_INTERVALS[:year].eq(year))
        clause = clause.and(BUDGET_ITEMS[:deleted_at].eq(nil)) unless include_deleted

        clause
      end

      attr_reader :user_id, :month, :year, :include_deleted

      class QueryResult
        def initialize(result_hash)
          SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", result_hash.fetch(attribute_name))
          end
        end

        attr_reader(*SELECTS.keys.map(&:to_sym))

        private

        attr_reader :result_hash
      end

      private_constant :QueryResult
    end
  end
end
