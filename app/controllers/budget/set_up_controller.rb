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
        user: current_user,
        events: events,
        month: month,
        year: year
      )
    end

    def current_interval
      @current_interval ||= Budget::Interval.current(user: current_user)
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
        event_params.permit(:budget_item_key, :amount, :event_type, :month, :year, :budget_category_slug, :data)
      end
    end

    def namespace
      'budget'
    end

    def query
      GraphQueries::BudgetItems.setup_query(
        current_user.id,
        month: month,
        year: year,
        base_interval_month: base_interval_month,
        base_interval_year: base_interval_year
      )
    end

    def additional_props
      { selectedAccountPath: selected_account_path }
    end
  end
end
