# frozen_string_literal: true

module Presenters
  module Budget
    class CategoryPresenter < SimpleDelegator
      alias is_accrual accrual?

      alias is_expense expense?

      alias is_monthly monthly?

      alias is_day_to_day weekly?
    end
  end
end
