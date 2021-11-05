# frozen_string_literal: true

module Queries
  class AccountsQuery
    def initialize(include_inactive)
      @include_inactive = include_inactive
    end

    def self.execute(include_inactive:)
      new(include_inactive).execute
    end

    def execute
      scoped_query.map do |account|
        balance = balances.fetch(account.id, 0)
        AccountPresenter.new(account, balance: balance)
      end
    end

    private

    def scoped_query
      @scoped_query ||=
        begin
          query = Account.all
          query = query.where(archived_at: nil) unless include_inactive
          query
        end
    end

    def balances
      @balances ||= Transaction::Detail.balances_for(scoped_query.pluck(:id))
    end

    attr_reader :include_inactive
  end
end
