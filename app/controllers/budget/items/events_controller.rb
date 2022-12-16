# frozen_string_literal: true

module Budget
  module Items
    class EventsController < ApplicationController
      def create
        if form.save
          redirect_to budget_path(month: month, year: year)
        else
          render inertia: 'BudgetItemIndexApp', props: form.errors
        end
      end

      private

      def form
        @form ||= Budget::Events::Form.new(current_user, events: events_params)
      end

      def events_params
        params.require(:events).map do |event_params|
          event_params.permit(:budget_item_key, :amount, :event_type, :month, :year, :budget_category_slug, :data)
        end
      end

      def month
        params.fetch(:month, current_interval.month).to_i
      end

      def year
        params.fetch(:year, current_interval.year).to_i
      end

      def current_interval
        @current_interval ||= Budget::Interval.current(user: current_user)
      end
    end
  end
end
