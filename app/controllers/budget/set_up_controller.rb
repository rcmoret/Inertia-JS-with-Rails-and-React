# frozen_string_literal: true

module Budget
  class SetUpController < ApplicationController
    include GraphQuery

    def new
      render inertia: 'BudgetSetupApp', props: props
    end

    def create
      if form.save
        redirect_to "/budget/#{target_interval_month}/#{target_interval_year}"
      else
        render inertia: 'BudgetSetupApp', props: props.merge(errors: form.errors)
      end
    end

    private

    def form
      @form ||= Budget::Events::SetupForm.new(
        events: events,
        month: target_interval_month,
        year: target_interval_year
      )
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

    def events
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
            categories(includeArchived: true) {
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
                budgetCategoryId
                budgeted: amount
                spent
                isAccrual
                isExpense
                isMonthly
              }
            }
            targetInterval: interval(month: #{target_interval_month}, year: #{target_interval_year}) {
              month
              year
              items {
                id
                name
                budgetCategoryId
                amount
                isAccrual
                isExpense
                isMonthly
              }
            }
          }
        }
      GQL
    end
  end
end
