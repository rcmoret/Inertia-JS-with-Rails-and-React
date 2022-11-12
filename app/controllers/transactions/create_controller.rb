# frozen_string_literal: true

module Transactions
  class CreateController < ApplicationController
    def call
      if transaction_form.save
        redirect_to account_transactions_path(transaction_form.account.slug, month: month, year: year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: transaction_form.errors
      end
    end

    private

    def transaction_form
      @transaction_form ||= Forms::TransactionForm.new(Transaction::Entry.new, params)
    end

    def current_interval
      Budget::Interval.current
    end

    def month
      params.fetch(:month, current_interval.month)
    end

    def year
      params.fetch(:year, current_interval.year)
    end
  end
end
