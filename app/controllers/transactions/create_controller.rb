# frozen_string_literal: true

module Transactions
  class CreateController < ApplicationController
    def call
      if transaction.save
        redirect_to account_transactions_path(transaction.account.slug, month: month, year: year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: transaction.errors
      end
    end

    private

    def transaction
      @transaction ||= Transaction::Entry.new(create_params.to_h.deep_transform_keys(&:underscore))
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

    def create_params
      params.require(:transaction).permit(
        :accountId,
        :budgetExclusion,
        :checkNumber,
        :clearanceDate,
        :description,
        :notes,
        :receipt,
        detailsAttributes: %i[id amount budgetItemId _destroy]
      )
    end
  end
end
