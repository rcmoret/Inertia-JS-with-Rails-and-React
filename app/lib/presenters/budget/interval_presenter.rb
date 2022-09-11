# frozen_string_literal: true

module Presenters
  module Budget
    class IntervalPresenter < SimpleDelegator
      def inititalize(interval, user)
        @user = user
        super(interval)
      end

      attr_reader :user

      def current?
        !closed_out? && prev.closed_out?
      end
      alias is_current current?

      def future?
        !closed_out? && !current?
      end
      alias is_future future?

      def items(include_deleted: false, reviewable_only: false)
        items_query = include_deleted ? item_views : item_views.active

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
        @available_cash ||=
          if current?
            Account.available_cash(user) + charged
          elsif closed_out?
            charged + Transaction::Detail.for(user).prior_to(last_date + 1.day).cash_flow.sum(:amount)
          else
            0
          end
      end

      private

      def item_views
        super
          .includes(:transactions)
          .includes(events: :type)
          .includes(:maturity_intervals)
      end

      def today
        @today ||= Time.zone.today
      end

      def charged
        @charged ||= Transaction::Detail
                     .for(user)
                     .budget_inclusions
                     .non_cash_flow
                     .between(date_range, include_pending: current?)
                     .sum(:amount)
      end

      def prev
        @prev ||= super.as_presenter
      end
    end
  end
end
