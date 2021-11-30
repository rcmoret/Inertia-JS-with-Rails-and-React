# frozen_string_literal: true

module Budget
  class FinalizeController < ApplicationController
    include GraphQuery

    def new
      render inertia: 'BudgetFinalizeApp', props: props
    end

    def complete
      form = Budget::Events::Form.new(events: events_params)
      if form.save
        interval.update(close_out_completed_at: Time.current)
        redirect_to "/budget/#{target_interval_month}/#{target_interval_year}"
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
      if base_interval_month == 12
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
          budget {
            categories {
              id
              name
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
            baseInterval: interval(month: #{base_interval_month}, year: #{base_interval_year}) {
              discretionary { amount }
              month
              year
              items(reviewableOnly: true) {
                budgetItemId: id
                budgetCategoryId
                remaining
              }
            }
            targetInterval: interval(month: #{target_interval_month}, year: #{target_interval_year}) {
              month
              year
              items {
                budgetItemId: id
                budgetCategoryId
                budgeted: amount
              }
            }
          }
        }
      GQL
    end
  end
end
