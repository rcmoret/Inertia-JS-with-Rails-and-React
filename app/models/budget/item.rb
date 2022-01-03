# frozen_string_literal: true

module Budget
  class Item < ApplicationRecord
    include Budget::SharedItem
    include Presentable

    validates_uniqueness_of :budget_category_id,
                            scope: :budget_interval_id,
                            conditions: -> { active },
                            if: :weekly?

    delegate :accrual,
             :expense?,
             :icon_class_name,
             :monthly?,
             :name,
             to: :category

    def view
      @view ||= ItemView.find(id)
    end

    def delete
      raise NonDeleteableError if transaction_details.any?

      update(deleted_at: Time.current)
    end

    def amount
      events.sum(:amount)
    end
    NonDeleteableError = Class.new(StandardError)

    private

    def presenter_class
      if monthly?
        Presenters::Budget::MonthlyItemPresenter
      elsif expense?
        Presenters::Budget::DayToDayExpensePresenter
      else
        Presenters::Budget::DayToDayRevenuePresenter
      end
    end
  end
end
