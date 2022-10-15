# frozen_string_literal: true

module Queries
  module Budget
    class ItemEventsQuery
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
        BUDGET_ITEM_EVENTS
          .project(*selects)
          .join(BUDGET_ITEMS).on(BUDGET_ITEMS[:id].eq(BUDGET_ITEM_EVENTS[:budget_item_id]))
          .join(BUDGET_INTERVALS).on(interval_join)
          .join(BUDGET_ITEM_EVENT_TYPES)
          .on(BUDGET_ITEM_EVENT_TYPES[:id].eq(BUDGET_ITEM_EVENTS[:budget_item_event_type_id]))
          .group(BUDGET_ITEM_EVENTS[:budget_item_id])
      end

      def selects
        [
          BUDGET_ITEM_EVENTS[:budget_item_id].as('budget_item_id'),
          BUDGET_ITEM_EVENTS[:amount].sum.as('amount'),
          json_select.as('collection'),
        ]
      end

      def json_select
        SQLFunctions.sql_to_json(SQLFunctions.array_agg(json_object))
      end

      def json_object
        SQLFunctions.json_build_object(
          Arel::Nodes::Quoted.new('id'), BUDGET_ITEM_EVENTS[:id],
          Arel::Nodes::Quoted.new('data'), BUDGET_ITEM_EVENTS[:data],
          Arel::Nodes::Quoted.new('amount'), BUDGET_ITEM_EVENTS[:amount],
          Arel::Nodes::Quoted.new('created_at'), BUDGET_ITEM_EVENTS[:created_at],
          Arel::Nodes::Quoted.new('type_description'), BUDGET_ITEM_EVENT_TYPES[:name]
        )
      end

      attr_reader :month, :year, :user_id

      class NullQueryResult
        def initialize(*); end

        def amount
          0
        end

        def collection
          []
        end
      end

      class QueryResult
        EVENT_KEYS = %i[id amount data created_at type_description].freeze

        def initialize(result_hash)
          @budget_item_id, @amount = result_hash.fetch_values('budget_item_id', 'amount')
          @collection = JSON.parse(result_hash.fetch('collection'), symbolize_names: true).map do |event|
            event[:data] = event[:data].to_json if event[:data].present?
            Event.new(*event.values_at(*EVENT_KEYS))
          end
        end

        attr_reader :budget_item_id, :amount, :collection

        Event = Struct.new(*EVENT_KEYS)
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
