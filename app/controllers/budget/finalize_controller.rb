# frozen_string_literal: true

module Budget
  class FinalizeController < ApplicationController
    include GraphQuery

    def new
      render inertia: "BudgetFinalizeApp", props: props
    end

    def complete
      form = Budget::Events::Form.new(events: events_params)
      require 'pry'; binding.pry
      if form.save
        interval.update(close_out_completed_at: Time.current)
        redirect_to '/budget/set-up'
      else
        render inertia: 'BudgetFinalizeApp', props: props.merge(errors: form.errors)
      end
    end

    private

    def interval
      Budget::Interval.for(month: base_interval_month, year: base_interval_year)
    end

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

    def events_params
      params.require(:events).map do |event_params|
        event_params.permit(:budget_item_id, :amount, :event_type, :month, :year, :budget_category_id, :data)
      end
    end

    def namespace
      'budget'
    end

    def query
      <<~GQL
        {
          categories {
            id
            name
            isExpense
            isMonthly
          }
          baseInterval: interval(month: #{base_interval_month}, year: #{base_interval_year}) {
            discretionary
            month
            year
            items {
              budgetItemId: id
              budgetCategoryId
              budgeted: amount
              iconClassName
              isAccrual
              isExpense
              isMonthly
              month
              name
              remaining
              spent
              transactionDetailCount
              year
            }
          }
          targetInterval: interval(month: #{target_interval_month}, year: #{target_interval_year}) {
            month
            year
            items {
              budgetItemId: id
              name
              budgetCategoryId
              amount
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