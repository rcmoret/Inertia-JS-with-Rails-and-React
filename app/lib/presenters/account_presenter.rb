module Presenters
  class AccountPresenter < SimpleDelegator
    def initialize(account, balance: nil)
      @balance = balance || account.balance
      super(account)
    end

    attr_reader :balance
  end
end
