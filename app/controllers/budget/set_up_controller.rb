# frozen_string_literal: true

module Budget
  class SetUpController < ApplicationController
    include GraphQuery
    skip_before_action :authenticate_user!

    def new
      render inertia: "BudgetSetupApp", props: graph_data
    end

    private

    def today
      Time.current
    end

    def target_interval_month
      if base_interval_month == 12
        1
      else
        base_interval_month + 1
      end
    end

    def target_interval_year
      if target_interval_month == 12
        base_interval_year + 1
      else
        base_interval_year
      end
    end

    def base_interval_month
      params.fetch(:month, today.month).to_i
    end

    def base_interval_year
      params.fetch(:year, today.year).to_i
    end

    def query
      <<~GQL
        {
          categories {
            id
            defaultAmount
            name
            iconClassName
            isAccrual
            isExpense
            isMonthly
          }
          baseInterval: interval(month: #{base_interval_month}, year: #{base_interval_year}) {
            month
            year
            items {
              name
              amount
              spent
              month
              year
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
          }
          targetInterval: interval(month: #{target_interval_month}, year: #{target_interval_year}) {
            month
            year
            items {
              name
              amount
              spent
              month
              year
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
          }
        }
      GQL
    end
  end
end
