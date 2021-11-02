# frozen_string_literal: true

class BudgetController < ApplicationController
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
        categories {
          id
          defaultAmount
          name
          iconClassName
          isAccrual
          isExpense
          isMonthly
        }
        targetInterval: interval(month: #{interval_month}, year: #{interval_year}) {
          month
          year
          items {
            id
            budgetCategoryId
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
