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
        @form ||= Budget::Events::Form.new(events: events_params)
      end

      def events_params
        params.require(:events).map do |event_params|
          event_params.permit(:budget_item_id, :amount, :event_type, :month, :year, :budget_category_id, :data)
        end
      end

      def month
        params.fetch(:month, today.month).to_i
      end

      def year
        params.fetch(:year, today.year).to_i
      end

      def today
        @today ||= Time.current
      end
    end
  end
end
