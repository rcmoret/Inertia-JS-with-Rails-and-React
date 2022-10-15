# frozen_string_literal: true

module Queries
  module Transactions
    module Shared
      extend ActiveSupport::Concern

      # tables
      ACCOUNTS = Constants::Tables::ACCOUNTS
      BUDGET_CATEGORIES = Constants::Tables::BUDGET_CATEGORIES
      BUDGET_ITEMS = Constants::Tables::BUDGET_ITEMS
      ICONS = Constants::Tables::ICONS
      TRANSACTIONS = Constants::Tables::TRANSACTIONS
      TRANSACTION_DETAILS = Constants::Tables::TRANSACTION_DETAILS

      # joins
      ACCOUNT_TRANSACTIONS_JOIN = Constants::Joins::ACCOUNT_TRANSACTIONS_JOIN
      BUDGET_CATEGORY_JOIN = Constants::Joins::BUDGET_CATEGORY_JOIN
      DETAIL_ITEM_JOIN = Constants::Joins::DETAIL_ITEM_JOIN
      ICON_CATEGORY_JOIN = Constants::Joins::ICON_CATEGORY_JOIN
      TRANSACTION_DETAILS_JOIN = Constants::Joins::TRANSACTION_DETAILS_JOIN

      # selects
      DETAIL_SELECTS = Constants::Selects::DETAIL_SELECTS
    end
  end
end
