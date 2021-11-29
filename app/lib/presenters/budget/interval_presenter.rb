# frozen_string_literal: true

module Presenters
  module Budget
    class IntervalPresenter < SimpleDelegator
      def current?
        !closed_out? && prev.as_presenter.closed_out?
      end
      alias is_current current?

      def accrual_items
        with_presenters { item_views.accruals }
      end

      def items(include_deleted: false, reviewable_only: false)
        items_query = item_views
        items_query = items_query.active unless include_deleted

        items_query.map(&:as_presenter).then do |item_presenters|
          item_presenters.select!(&:reviewable?) if reviewable_only

          item_presenters
        end
      end

      def discretionary
        DiscretionaryPresenter.new(self)
      end

      def balance
        if current?
          (available_cash + charged).to_i
        else
          0
        end
      end

      def set_up?
        set_up_completed_at.present?
      end
      alias is_set_up set_up?

      def closed_out?
        close_out_completed_at.present?
      end
      alias is_closed_out closed_out?

      def total_days
        (last_date - first_date).to_i + 1
      end

      def days_remaining
        if current?
          (last_date - today + 1).to_i
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
        @available_cash ||= current? ? Account.available_cash : 0
      end

      private

      def today
        @today ||= Date.today
      end

      def charged
        return 0 unless current?

        @charged ||= Transaction::DetailView
                     .budget_inclusions
                     .non_cash_flow
                     .between(
                       date_range,
                       include_pending: current?
                     ).sum(:amount)
      end
    end
  end
end
