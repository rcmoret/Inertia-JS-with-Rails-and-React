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

    private

    def attributes
      @attributes ||= super.symbolize_keys
    end
  end
end
