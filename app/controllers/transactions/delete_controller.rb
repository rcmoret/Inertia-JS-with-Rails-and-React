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
      @transaction ||= Transaction::Entry.belonging_to(current_user).find(params.fetch(:id))
    end

    def current_interval
      Budget::Interval.current(user: current_user)
    end

    def month
      params.fetch(:month, current_interval.month)
    end

    def year
      params.fetch(:year, current_interval.year)
    end
  end
end
