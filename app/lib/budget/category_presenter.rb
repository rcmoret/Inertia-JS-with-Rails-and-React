# frozen_string_literal: true

module Budget
  class CategoryPresenter < SimpleDelegator
    def accrual?
      super
    end
    alias_method :is_accrual, :accrual?

    def expense?
      super
    end
    alias_method :is_expense, :expense?

    def monthly?
      super
    end
    alias_method :is_monthly, :monthly?

    def weekly?
      super
    end
    alias_method :is_day_to_day, :weekly?
  end
end
