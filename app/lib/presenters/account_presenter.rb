# frozen_string_literal: true

module Presenters
  class AccountPresenter < SimpleDelegator
    def balance_prior_to(month:, year:)
      interval = ::Budget::Interval.where(user_group: user_group).for(month: month, year: year).as_presenter

      super(interval.first_date, include_pending: interval.future?)
    end

    def transactions(month:, year:)
      interval = ::Budget::Interval.where(user_group: user_group).for(month: month, year: year).as_presenter

      super()
        .between(interval.date_range, include_pending: interval.current?)
        .includes(
          :credit_transfer,
          :debit_transfer,
          receipt_attachment: :blob,
          details: { budget_item: { category: :icon } }
        ).map(&:as_presenter)
    end

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
