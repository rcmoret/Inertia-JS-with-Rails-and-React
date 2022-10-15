# frozen_string_literal: true

module Queries
  module Constants
    module Tables
      extend ActiveSupport::Concern

      ACCOUNTS = Account.arel_table
      BUDGET_CATEGORIES = ::Budget::Category.arel_table
      BUDGET_CATEGORY_MATURITY_INTERVALS = ::Budget::CategoryMaturityInterval.arel_table
      BUDGET_INTERVALS = ::Budget::Interval.arel_table
      BUDGET_ITEMS = ::Budget::Item.arel_table
      BUDGET_ITEM_EVENTS = ::Budget::ItemEvent.arel_table
      ICONS = Icon.arel_table
      TRANSACTION_DETAILS = Transaction::Detail.arel_table
      TRANSACTIONS = Transaction::Entry.arel_table
    end

    module Joins
      ACCOUNT_TRANSACTIONS_JOIN = Tables::TRANSACTIONS[:account_id].eq(Tables::ACCOUNTS[:id])
      BUDGET_CATEGORY_JOIN = Tables::BUDGET_CATEGORIES[:id].eq(Tables::BUDGET_ITEMS[:budget_category_id])
      DETAIL_ITEM_JOIN = Tables::TRANSACTION_DETAILS[:budget_item_id].eq(Tables::BUDGET_ITEMS[:id])
      ICON_CATEGORY_JOIN = Tables::ICONS[:id].eq(Tables::BUDGET_CATEGORIES[:icon_id])
      TRANSACTION_DETAILS_JOIN = Tables::TRANSACTION_DETAILS[:transaction_entry_id].eq(Tables::TRANSACTIONS[:id])
    end

    module Clauses
      CASH_FLOW_ACCOUNTS_CLAUSE = Tables::ACCOUNTS[:cash_flow].eq(true)
      NON_ARCHIVED_ACCOUNT_CLAUSE = Tables::ACCOUNTS[:archived_at].eq(nil)
      NON_CASH_FLOW_ACCOUNTS_CLAUSE = Tables::ACCOUNTS[:cash_flow].eq(false)
    end

    module Selects
      DETAIL_SELECTS = Transaction::Detail.columns.reduce({}) do |hash, column|
        hash.merge(column.name => Tables::TRANSACTION_DETAILS[column.name.to_sym])
      end.freeze

      ITEM_SELECTS = ::Budget::Item.columns.reduce({}) do |hash, column|
        hash.merge(column.name => Tables::BUDGET_ITEMS[column.name.to_sym])
      end.freeze
    end
  end
end
