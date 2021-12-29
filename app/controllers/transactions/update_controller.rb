# frozen_string_literal: true

module Transactions
  class UpdateController < ApplicationController
    def call
      if transaction.update(update_params)
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
      :account_id,
      :budget_exclusion,
      :check_number,
      :clearance_date,
      :description,
      :notes,
      { details_attributes: %i[id amount budget_item_id _destroy].freeze },
    ].freeze
  end
end
