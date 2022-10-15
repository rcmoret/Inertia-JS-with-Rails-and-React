# frozen_string_literal: true

module Queries
  module Transactions
    class DetailsForItem
      include Shared

      SELECTS = DETAIL_SELECTS.merge(
        'entry_id' => TRANSACTIONS[:id].as('entry_id'),
        'account_name' => ACCOUNTS[:name].as('account_name'),
        'clearance_date' => TRANSACTIONS[:clearance_date].as('clearance_date'),
        'description' => TRANSACTIONS[:description].as('description'),
        'budget_exclusion' => TRANSACTIONS[:budget_exclusion].as('budget_exclusion'),
        'notes' => TRANSACTIONS[:notes].as('notes'),
        'transfer_id' => TRANSACTIONS[:transfer_id].as('transfer_id'),
        'entry_created_at' => TRANSACTIONS[:created_at].as('entry_created_at'),
        'entry_updated_at' => TRANSACTIONS[:updated_at].as('entry_updated_at'),
        'category_name' => BUDGET_CATEGORIES[:name].as('category_name'),
        'icon_class_name' => ICONS[:class_name].as('icon_class_name')
      ).freeze

      def initialize(budget_item_key:)
        @budget_item_key = budget_item_key
      end

      def call
        ApplicationRecord.connection.exec_query(query.to_sql).map do |result|
          QueryResult.new(result)
        end
      end

      private

      attr_reader :budget_item_key

      def query
        BUDGET_ITEMS
          .project(*SELECTS.values)
          .join(TRANSACTION_DETAILS, Arel::Nodes::OuterJoin).on(DETAIL_ITEM_JOIN)
          .join(TRANSACTIONS, Arel::Nodes::OuterJoin).on(TRANSACTION_DETAILS_JOIN)
          .join(ACCOUNTS, Arel::Nodes::OuterJoin).on(ACCOUNT_TRANSACTIONS_JOIN)
          .join(BUDGET_CATEGORIES).on(BUDGET_CATEGORY_JOIN)
          .join(ICONS, Arel::Nodes::OuterJoin).on(ICON_CATEGORY_JOIN)
          .where(BUDGET_ITEMS[:key].eq(budget_item_key))
      end

      class QueryResult
        def initialize(result_hash)
          SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", result_hash.fetch(attribute_name))
          end
        end

        attr_reader(*SELECTS.keys.map(&:to_sym))
      end

      private_constant :QueryResult
    end
  end
end
