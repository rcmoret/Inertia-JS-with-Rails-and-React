# frozen_string_literal: true

module Budget
  class SetUpController < ApplicationController
    include AccountsHelper
    include GraphQuery

    def new
      render inertia: 'BudgetSetupApp', props: props
    end

    def create
      if form.save
        redirect_to "/budget/#{month}/#{year}"
      else
        render inertia: 'BudgetSetupApp', props: props.merge(errors: form.errors)
      end
    end

    private

    def form
      @form ||= Budget::Events::SetupForm.new(
        events: events,
        month: month,
        year: year
      )
    end

    def current_interval
      @current_interval ||= Budget::Interval.current
    end

    def month
      @month ||= params.fetch(:month, current_interval.month).to_i
    end

    def year
      @year ||= params.fetch(:year, current_interval.year).to_i
    end

    def base_interval_month
      return 12 if month == 1

      month - 1
    end

    def base_interval_year
      return year unless month == 1

      year - 1
    end

    def events
      @events ||= params.require(:events).map do |event_params|
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
            targetInterval: interval(month: #{month}, year: #{year}) {
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

    def additional_props
      { selectedAccountPath: selected_account_path }
    end
  end
end
