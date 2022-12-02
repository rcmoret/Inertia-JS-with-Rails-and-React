# frozen_string_literal: true

module Budget
  class FinalizeController < ApplicationController
    include AccountsHelper
    include GraphQuery

    def new
      render inertia: 'BudgetFinalizeApp', props: props
    end

    def complete
      form = Budget::Events::Form.new(current_user, events: events_params)
      if form.save
        interval.update(close_out_completed_at: Time.current)
        redirect_to "/budget/#{target_interval_month}/#{target_interval_year}"
      else
        render inertia: 'BudgetFinalizeApp', props: props.merge(errors: form.errors)
      end
    end

    private

    def interval
      @interval ||= Budget::Interval.for(
        month: base_interval_month,
        year: base_interval_year,
        user_id: current_user.id
      )
    end

    def current_interval
      @current_interval ||= Budget::Interval.current(user: current_user)
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
      @base_interval_month ||= params.fetch(:month, current_interval.month).to_i
    end

    def base_interval_year
      @base_interval_year ||= params.fetch(:year, current_interval.year).to_i
    end

    def events_params
      @events_params ||= params.require(:events).map do |event_params|
        event_params.permit(:budget_item_key, :amount, :event_type, :month, :year, :budget_category_id, :data)
      end
    end

    def namespace
      'budget'
    end

    def query
      GraphQueries::BudgetItems.finalize_query(
        current_user.id,
        base_interval_month: base_interval_month,
        base_interval_year: base_interval_year,
        target_interval_month: target_interval_month,
        target_interval_year: target_interval_year
      )
    end

    def additional_props
      { selectedAccountPath: selected_account_path }
    end
  end
end
