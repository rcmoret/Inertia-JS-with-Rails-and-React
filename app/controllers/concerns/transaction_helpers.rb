# frozen_string_literal: true

module TransactionHelpers
  TEMPLATE_NAME = 'AccountTransactionsIndexApp'

  private

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
