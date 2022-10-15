# frozen_string_literal: true

module Queries
  module Accounts
    module Shared
      extend ActiveSupport::Concern

      def self.coalesce(*nodes)
        Arel::Nodes::NamedFunction.new('coalesce', nodes)
      end

      ACCOUNTS = Constants::Tables::ACCOUNTS
      TRANSACTIONS = Constants::Tables::TRANSACTIONS
      TRANSACTION_DETAILS = Constants::Tables::TRANSACTION_DETAILS
      ACCOUNT_TRANSACTIONS_JOIN = Constants::Joins::ACCOUNT_TRANSACTIONS_JOIN
      CASH_FLOW_ACCOUNTS_CLAUSE = Constants::Clauses::CASH_FLOW_ACCOUNTS_CLAUSE
      NON_CASH_FLOW_ACCOUNTS_CLAUSE = Constants::Clauses::NON_CASH_FLOW_ACCOUNTS_CLAUSE
      NON_ARCHIVED_ACCOUNT_CLAUSE = Constants::Clauses::NON_ARCHIVED_ACCOUNT_CLAUSE
      TRANSACTION_DETAILS_JOIN = Constants::Joins::TRANSACTION_DETAILS_JOIN
      BALANCE_SELECT = { 'balance' => coalesce(TRANSACTION_DETAILS[:amount].sum, 0).as('balance') }.freeze

      ACCOUNT_WITH_TRANSACTIONS_SELECTS = Account.columns.reduce(BALANCE_SELECT.dup) do |hash, column|
        hash.merge(column.name => ACCOUNTS[column.name.to_sym])
      end.freeze

      ACCOUNT_WITH_TRANSACTIONS =
        ACCOUNTS
        .join(TRANSACTIONS, Arel::Nodes::OuterJoin).on(ACCOUNT_TRANSACTIONS_JOIN)
        .join(TRANSACTION_DETAILS, Arel::Nodes::OuterJoin).on(TRANSACTION_DETAILS_JOIN)

      def user_clause
        ACCOUNTS[:user_id].eq(user_id)
      end
    end
  end
end
