# frozen_string_literal: true

module Queries
  module Budget
    class IntervalItems
      def initialize(month:, year:, user_id:, include_deleted:)
        @month = month
        @year = year
        @user_id = user_id
        @include_deleted = include_deleted
      end

      def call
        interval_items_query.reduce([]) do |collection, item_result|
          collection << build_result(item_result)
        end
      end

      private

      def interval
        @interval ||= ::Budget::Interval.for(
          month: month,
          year: year,
          user_id: user_id
        )
      end

      def interval_items_query
        @interval_items_query ||= IntervalItemsQuery.new(interval: interval, include_deleted: include_deleted).call
      end

      def details_query
        @details_query ||= TransactionDetailsQuery.new(month: month, year: year, user_id: user_id).call
      end

      def events_query
        @events_query ||= ItemEventsQuery.new(month: month, year: year, user_id: user_id).call
      end

      def maturity_intervals_query
        @maturity_intervals_query ||= MaturityIntervalsQuery.new(month: month, year: year, user_id: user_id).call
      end

      def build_result(item_result)
        budget_item_id = item_result.id
        budget_category_id = item_result.budget_category_id
        Result.new(
          item_result: item_result,
          events: events_query.fetch(budget_item_id),
          details: details_query.fetch(budget_item_id),
          upcoming_maturity_interval: maturity_intervals_query.fetch(budget_category_id)
        )
      end

      class Result
        include Presentable

        def initialize(item_result:, events:, details:, upcoming_maturity_interval:)
          IntervalItemsQuery::SELECTS.each_key do |attribute_name|
            instance_variable_set(:"@#{attribute_name}", item_result.public_send(attribute_name))
          end
          @transactions_count = details.transactions_count
          @transactions_total = details.transactions_total
          @amount = events.amount
          @events = events.collection
          @transaction_details = details.collection
          @upcoming_maturity_interval = upcoming_maturity_interval.to_hash
        end

        ATTRIBUTE_LIST = [
          *IntervalItemsQuery::SELECTS.keys.map(&:to_sym),
          :amount,
          :events,
          :details,
          :transaction_details,
          :transactions_count,
          :transactions_total,
          :upcoming_maturity_interval,
        ].freeze

        attr_reader(*ATTRIBUTE_LIST)

        def attributes
          ATTRIBUTE_LIST.reduce({}) { |hash, attribute| hash.merge(attribute => public_send(attribute)) }
        end

        private

        def presenter_class
          if monthly
            Presenters::Budget::MonthlyItemPresenter
          elsif expense
            Presenters::Budget::DayToDayExpensePresenter
          else
            Presenters::Budget::DayToDayRevenuePresenter
          end
        end
      end

      attr_reader :month, :year, :user_id, :include_deleted
    end
  end
end
