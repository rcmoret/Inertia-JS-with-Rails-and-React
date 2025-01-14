# frozen_string_literal: true

module Budget
  class Item < ApplicationRecord
    include HasKeyIdentifier
    include Fetchable
    include Presentable

    has_many :transaction_details,
             class_name: 'Transaction::Detail',
             foreign_key: :budget_item_id,
             inverse_of: :budget_item,
             dependent: :restrict_with_exception
    has_many :events,
             class_name: 'ItemEvent',
             foreign_key: :budget_item_id,
             inverse_of: :item,
             dependent: :restrict_with_exception

    belongs_to :category, foreign_key: :budget_category_id, inverse_of: :items
    belongs_to :interval,
               class_name: 'Interval',
               foreign_key: :budget_interval_id,
               inverse_of: :items

    validates :category, presence: true
    # rubocop:disable Rails/UniqueValidationWithoutIndex
    validates :budget_category_id, uniqueness: { scope: :budget_interval_id, if: -> { weekly? && active? } }
    # rubocop:enable Rails/UniqueValidationWithoutIndex

    scope :prior_to, ->(date_hash) { joins(:interval).merge(Interval.prior_to(date_hash)) }
    scope :in_range, ->(date_args) { joins(:interval).merge(Interval.in_range(date_args)) }
    scope :active, -> { where(deleted_at: nil) }
    scope :deleted, -> { where.not(deleted_at: nil) }
    scope :revenues, -> { joins(:category).merge(Category.revenues) }
    scope :expenses, -> { joins(:category).merge(Category.expenses) }
    scope :monthly, -> { joins(:category).merge(Category.monthly) }
    scope :weekly, -> { joins(:category).merge(Category.weekly) }
    scope :accruals, -> { joins(:category).merge(Category.accruals) }
    scope :non_accruals, -> { joins(:category).merge(Category.non_accruals) }
    scope :belonging_to, ->(user) { joins(:category).merge(Category.belonging_to(user)) }

    delegate :accrual,
             :expense?,
             :icon_class_name,
             :monthly?,
             :name,
             :per_diem_enabled,
             to: :category

    def delete
      raise NonDeleteableError if transaction_details.any?

      update(deleted_at: Time.current)
    end

    def weekly?
      !monthly?
    end

    def revenue?
      !expense?
    end

    def deletable?
      transaction_details.none?
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

    def active?
      deleted_at.nil?
    end
  end
end
