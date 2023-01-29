# frozen_string_literal: true

module Queries
  module Budget
    class IntervalItemsQuery
      def initialize(items:, include_deleted:, reviewable_only:, month:, year:)
        @items = items
        @include_deleted = include_deleted
        @reviewable_only = reviewable_only
        @month = month
        @year = year
      end

      def call
        scope = include_deleted ? base_scope : base_scope.active

        collection = scope.map(&:as_presenter)

        collection.select!(&:reviewable?) if reviewable_only

        collection
      end

      private

      def base_scope
        items.includes(
          category: [{ maturity_intervals: :interval }, :icon],
          events: :type,
          # maturity_intervals: :interval,
          transaction_details: { entry: :account }
        )
      end

      attr_reader :items, :include_deleted, :reviewable_only, :month, :year
    end
  end
end
