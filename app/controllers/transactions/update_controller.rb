# frozen_string_literal: true

module Transactions
  class UpdateController < ApplicationController
    def call
      if transaction.update(update_params.to_h.deep_transform_keys(&:underscore))
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

    def update_params
      params.require(:transaction).permit(*PERMITTED_ATTRIBUTES)
    end

    PERMITTED_ATTRIBUTES = [
      :accountId,
      :budgetExclusion,
      :checkNumber,
      :clearanceDate,
      :description,
      :notes,
      :receipt,
      { detailsAttributes: %i[id amount budgetItemId _destroy].freeze },
    ].freeze
  end
end
