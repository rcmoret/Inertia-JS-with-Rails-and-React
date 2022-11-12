# frozen_string_literal: true

module Transactions
  class UpdateController < ApplicationController
    before_action :account_slug

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

    def transaction
      @transaction ||= Transaction::Entry.find(params.fetch(:id))
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

    def account_slug
      @account_slug ||= transaction.account.slug
    end
  end
end
