# frozen_string_literal: true

module Transactions
  class DeleteController < ApplicationController
    def call
      if transaction.destroy
        redirect_to account_transactions_path(transaction.account.slug, month: month, year: year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: transaction.errors
      end
    end

    private

    def transaction
      @transaction ||= Transaction::Entry.find(params.fetch(:id))
    end

    def today
      Time.current
    end

    def month
      params.fetch(:month, today.month)
    end

    def year
      params.fetch(:year, today.year)
    end
  end
end
