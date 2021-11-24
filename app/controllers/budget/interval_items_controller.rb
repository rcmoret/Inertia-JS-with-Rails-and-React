# frozen_string_literal: true

module Budget
  class IntervalItemsController < ApplicationController
    include GraphQuery
    skip_before_action :authenticate_user!

    def index
      render inertia: 'BudgetSetupApp', props: graph_data
    end

    private

    def today
      Time.current
    end

    def interval_month
      params.fetch(:month, today.month).to_i
    end

    def interval_year
      params.fetch(:year, today.year).to_i
    end

    def query
      <<~GQL
        {
          budget {
            categories {
              id
              defaultAmount
              name
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
            interval(month: #{interval_month}, year: #{interval_year}) {
              month
              year
              discretionary
              isCurrent
              totalDays
              firstDate
              daysRemaining
              items {
                id
                budgetCategoryId
                name
                amount
                difference
                remaining
                spent
                iconClassName
                isAccrual
                isExpense
                isMonthly
                transactionDetailCount
              }
            }
          }
        }
      GQL
    end
  end
end
