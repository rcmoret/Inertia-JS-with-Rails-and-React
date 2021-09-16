# frozen_string_literal: true

module Budget
  class ItemPresenter < SimpleDelegator
    def name
      attributes.fetch(:name) { category.name }
    end

    def amount
      attributes.fetch(:amount) { super }
    end

    def spent
      attributes.fetch(:spent) { transaction_details.sum(:amount) }
    end

    def icon_class_name
      attributes.fetch(:icon_class_name) { category.icon_class_name }
    end

    def accrual?
      attributes.fetch(:accrual) { category.accrual? }
    end
    alias_method :is_accrual, :accrual?

    def month
      attributes.fetch(:month) { interval.month }
    end

    def year
      attributes.fetch(:year) { interval.year }
    end

    def monthly?
      attributes.fetch(:monthly?) { category.monthly? }
    end
    alias_method :is_monthly, :monthly?

    def expense?
      attributes.fetch(:expense?) { category.expense? }
    end
    alias_method :is_expense, :expense?

    private

    def attributes
      super.symbolize_keys
    end
  end
end
