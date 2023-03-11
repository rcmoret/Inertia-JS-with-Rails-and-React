# frozen_string_literal: true

module Presenters
  module Budget
    class BaseItemPresenter < ApplicationSerializer
      attribute :is_accrual, alias_of: :accrual?
      attribute :is_expense, alias_of: :expense?
      attribute :is_deleted, alias_of: :deleted?
      attribute :is_monthly, alias_of: :monthly?
      attribute :budget_category_slug, alias_of: :slug

      delegate :accrual?,
               :expense?,
               :is_per_diem_enabled,
               :maturity_intervals,
               :monthly?,
               :slug,
               to: :category
      delegate :month, :year, to: :interval

      def events
        @events ||= super.map(&:as_presenter)
      end

      def transaction_details
        @transaction_details ||= super.map(&:as_presenter)
      end

      def amount
        @amount ||= events.map(&:amount).sum
      end

      def spent
        @spent ||= transaction_details.map(&:amount).sum
      end

      def transaction_detail_count
        @transaction_detail_count ||= transaction_details.size
      end

      def difference
        @difference ||= amount - spent
      end

      def deletable?
        transaction_detail_count.zero?
      end
      alias is_deletable deletable?

      def maturity_month
        return unless accrual?

        upcoming_maturity_interval&.month
      end

      def maturity_year
        return unless accrual?

        upcoming_maturity_interval&.year
      end

      private

      def upcoming_maturity_interval
        @upcoming_maturity_interval ||= maturity_intervals.on_or_after(month: month, year: year).take
      end

      def deleted?
        deleted_at.present?
      end

      def item
        @item ||= __getobj__
      end
    end
  end
end
