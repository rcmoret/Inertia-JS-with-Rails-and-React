# frozen_string_literal: true

module TransactionHelpers
  private

  def transaction
    @transaction ||= Transaction::Entry.belonging_to(current_user).for(params.fetch(:key))
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

  def account_slug
    @account_slug ||= transaction.account.slug
  end
end
