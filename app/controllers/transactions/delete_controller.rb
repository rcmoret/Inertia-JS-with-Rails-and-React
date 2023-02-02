# frozen_string_literal: true

module Transactions
  class DeleteController < ApplicationController
    include TransactionHelpers

    def call
      if transaction_entry.destroy
        redirect_to account_transactions_path(transaction_entry.account.slug, month: month, year: year)
      else
        render inertia: TEMPLATE_NAME, props: transaction_entry.errors
      end
    end

    def transaction_entry
      @transaction_entry ||= Transaction::Entry.fetch(user: current_user, identifier: params.fetch(:key))
    end
  end
end
