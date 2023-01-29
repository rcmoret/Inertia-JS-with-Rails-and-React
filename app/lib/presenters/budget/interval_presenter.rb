# frozen_string_literal: true

module Presenters
  module Budget
    class IntervalPresenter < SimpleDelegator
      def current?
        !closed_out? && prev.closed_out?
      end
      alias is_current current?

      def future?
        !closed_out? && !current?
      end
      alias is_future future?

      def items(include_deleted: false, reviewable_only: false)
        Queries::Budget::IntervalItemsQuery.new(
          items: super(),
          include_deleted: include_deleted,
          reviewable_only: reviewable_only,
          month: month,
          year: year
        ).call
      end

      def discretionary
        DiscretionaryPresenter.new(self)
      end

      def set_up?
        super
      end
      alias is_set_up set_up?

      def closed_out?
        close_out_completed_at.present?
      end
      alias is_closed_out closed_out?

      def first_date
        super.to_date
      end

      def last_date
        super.to_date
      end

      def total_days
        (last_date - first_date).to_i + 1
      end

      def days_remaining
        if current?
          [(last_date - today + 1).to_i.abs, 1].max
        elsif closed_out?
          0
        else
          total_days
        end
      end

      def date_range
        first_date..last_date
      end

      def available_cash
        return 0 unless current? || closed_out?

        @available_cash ||=
          Queries::Accounts::AvailableCash.new(budget_interval: self).call
      end

      private

      def today
        @today ||= Time.zone.today
      end

      def prev
        @prev ||= super.as_presenter
      end
    end
  end
end
