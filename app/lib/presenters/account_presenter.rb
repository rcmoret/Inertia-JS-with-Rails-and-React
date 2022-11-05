# frozen_string_literal: true

module Presenters
  class AccountPresenter < SimpleDelegator
    def balance_prior_to(month:, year:, user_id:)
      interval = ::Budget::Interval.for(month: month, year: year, user_id: user_id).as_presenter

      super(interval.first_date, include_pending: interval.future?)
    end

    def transactions(month:, year:, user_id:)
      interval = ::Budget::Interval.for(month: month, year: year, user_id: user_id).as_presenter

      super()
        .between(interval.date_range, include_pending: interval.current?)
        .includes(details: { budget_item: { category: :icon } })
        .map(&:as_presenter)
    end

    def cash_flow?
      super
    end
    alias is_cash_flow cash_flow?

    def archived?
      archived_at.present?
    end
    alias is_archived archived?

    private

    def attributes(key, &block)
      super().symbolize_keys.fetch(key, &block)
    end
  end
end
