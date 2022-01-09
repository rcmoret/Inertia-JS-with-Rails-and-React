# frozen_string_literal: true

module Presenters
  class AccountPresenter < SimpleDelegator
    def balance
      attributes(:balance) { super }
    end

    def balance_prior_to(month:, year:)
      interval = ::Budget::Interval.for(month: month, year: year).as_presenter

      super(interval.first_date, include_pending: interval.future?)
    end

    def transactions(month:, year:)
      interval = ::Budget::Interval.for(month: month, year: year).as_presenter

      transaction_views
        .between(interval.date_range, include_pending: interval.current?)
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
