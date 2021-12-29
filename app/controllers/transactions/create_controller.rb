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
      @transaction ||= Transaction::Entry.new(create_params)
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

    def create_params
      params.require(:transaction).permit(
        :account_id,
        :budget_exclusion,
        :check_number,
        :clearance_date,
        :description,
        :notes,
        details_attributes: %i[amount budget_item_id]
      )
    end
  end
end
