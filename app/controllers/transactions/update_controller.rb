# frozen_string_literal: true

module Transactions
  class UpdateController < ApplicationController
    include TransactionHelpers

    def call
      if transaction_form.save
        redirect_to account_transactions_path(account_slug, month: month, year: year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: transaction_form.errors
      end
    end

    private

    def transaction_form
      @transaction_form ||= Forms::TransactionForm.new(transaction, params)
    end
  end
end
