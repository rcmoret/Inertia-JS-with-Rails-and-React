# frozen_string_literal: true

module Transactions
  class UpdateController < ApplicationController
    include TransactionHelpers

    def call
      if transaction_form.save
        redirect_to account_transactions_path(transaction_form.account_slug, month: month, year: year)
      else
        render inertia: TEMPLATE_NAME, props: transaction_form.errors
      end
    end

    private

    def transaction_form
      @transaction_form ||= Forms::TransactionForm.new(current_user, transaction_entry, params)
    end

    def transaction_entry
      @transaction_entry ||= Transaction::Entry.fetch(user: current_user, identifier: params.fetch(:key))
    end
  end
end
