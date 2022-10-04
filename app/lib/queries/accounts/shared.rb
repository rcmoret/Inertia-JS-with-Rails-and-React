# frozen_string_literal: true

module Queries
  module Accounts
    module Shared
      extend ActiveSupport::Concern

      def self.coalesce(*nodes)
        Arel::Nodes::NamedFunction.new('coalesce', nodes)
      end

      ACCOUNTS = Account.arel_table
      TRANSACTIONS = Transaction::Entry.arel_table
      TRANSACTION_DETAILS = Transaction::Detail.arel_table
      ACCOUNT_TRANSACTIONS_JOIN = TRANSACTIONS[:account_id].eq(ACCOUNTS[:id])
      CASH_FLOW_ACCOUNTS_CLAUSE = ACCOUNTS[:cash_flow].eq(true)
      NON_CASH_FLOW_ACCOUNTS_CLAUSE = ACCOUNTS[:cash_flow].eq(false)
      NON_ARCHIEVED_ACCOUNT_CLAUSE = ACCOUNTS[:archived_at].eq(nil)
      TRANSACTION_DETAILS_JOIN = TRANSACTION_DETAILS[:transaction_entry_id].eq(TRANSACTIONS[:id])
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
