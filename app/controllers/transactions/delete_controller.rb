# frozen_string_literal: true

module Transactions
  class DeleteController < ApplicationController
    include TransactionHelpers

    def call
      if transaction.destroy
        redirect_to account_transactions_path(account_slug, month: month, year: year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: transaction.errors
      end
    end
  end
end
