# frozen_string_literal: true

module Queries
  module Budget
    module Shared
      extend ActiveSupport::Concern

      # tables
      ACCOUNTS = Constants::Tables::ACCOUNTS
      BUDGET_CATEGORIES = Constants::Tables::BUDGET_CATEGORIES
      BUDGET_INTERVALS = Constants::Tables::BUDGET_INTERVALS
      BUDGET_ITEMS = Constants::Tables::BUDGET_ITEMS
      BUDGET_ITEM_EVENT_TYPES = ::Budget::ItemEventType.arel_table
      BUDGET_ITEM_EVENTS = Constants::Tables::BUDGET_ITEM_EVENTS
      ICONS = Constants::Tables::ICONS
      BUDGET_CATEGORY_MATURITY_INTERVALS = Constants::Tables::BUDGET_CATEGORY_MATURITY_INTERVALS
      TRANSACTION_DETAILS = Constants::Tables::TRANSACTION_DETAILS
      TRANSACTIONS = Constants::Tables::TRANSACTIONS

      # joins
      ACCOUNT_TRANSACTIONS_JOIN = Constants::Joins::ACCOUNT_TRANSACTIONS_JOIN
      BUDGET_CATEGORY_JOIN = Constants::Joins::BUDGET_CATEGORY_JOIN
      DETAIL_ITEM_JOIN = Constants::Joins::DETAIL_ITEM_JOIN
      ICON_CATEGORY_JOIN = Constants::Joins::ICON_CATEGORY_JOIN
      TRANSACTION_DETAILS_JOIN = Constants::Joins::TRANSACTION_DETAILS_JOIN

      # selects
      ITEM_SELECTS = Constants::Selects::ITEM_SELECTS.dup

      def interval_join
        BUDGET_INTERVALS[:id]
          .eq(BUDGET_ITEMS[:budget_interval_id])
          .and(BUDGET_INTERVALS[:month].eq(month))
          .and(BUDGET_INTERVALS[:year].eq(year))
      end
    end
  end
end
