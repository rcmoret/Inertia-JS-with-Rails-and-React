# frozen_string_literal: true

module Budget
  class Category < ApplicationRecord
    include BelongsToUserGroup
    include Fetchable
    include Messages
    include Presentable
    include Slugable

    has_many :items, foreign_key: :budget_category_id, inverse_of: :category, dependent: :restrict_with_exception
    has_many :transaction_details, through: :items
    has_many :events, through: :items
    has_many :maturity_intervals,
             -> { ordered },
             class_name: 'CategoryMaturityInterval',
             dependent: :destroy,
             inverse_of: :category,
             foreign_key: :budget_category_id
    belongs_to :icon, optional: true

    validates :default_amount,
              numericality: {
                less_than_or_equal_to: 0,
                message: EXPENSE_AMOUNT_VALIDATION_MESSAGE,
              },
              if: :expense?
    validates :default_amount,
              numericality: {
                greater_than_or_equal_to: 0,
                message: REVENUE_AMOUNT_VALIDATION_MESSAGE,
              },
              if: :revenue?

    # rubocop:disable Rails/UniqueValidationWithoutIndex
    validates :name, :slug, uniqueness: { conditions: -> { active } }
    # rubocop:enable Rails/UniqueValidationWithoutIndex
    validates :default_amount, :name, presence: true
    validate :accrual_on_expense
    validate :per_diem_disabled, if: :monthly?

    scope :active, -> { where(archived_at: nil) }
    scope :accruals, -> { where(accrual: true) }
    scope :non_accruals, -> { where(accrual: false) }
    scope :monthly, -> { where(monthly: true) }
    scope :weekly, -> { where(monthly: false) }
    scope :expenses, -> { where(expense: true) }
    scope :revenues, -> { where(expense: false) }

    alias_attribute :per_diem_enabled?, :is_per_diem_enabled
    delegate :to_json, to: :to_hash
    delegate :class_name, :name, to: :icon, prefix: true, allow_nil: true

    def revenue?
      !expense?
    end

    def weekly?
      !monthly?
    end

    def to_hash
      attributes
        .symbolize_keys
        .merge(icon_class_name: icon_class_name)
    end

    def archived?
      archived_at.present?
    end

    def archive!
      update(archived_at: Time.current)
    end

    def unarchive!
      update(archived_at: nil)
    end

    # rubocop:disable Rails/ActiveRecordOverride
    def destroy
      items.none? ? super : archive!
    end
    # rubocop:enable Rails/ActiveRecordOverride

    private

    def accrual_on_expense
      return if expense? || (!accrual && revenue?)

      errors.add(:accrual, 'can only be enabled for expenses')
    end

    def per_diem_disabled
      return unless per_diem_enabled?

      errors.add(:is_per_diem_enabled, 'not available on monthly category')
    end

    def presenter_class
      Presenters::Budget::CategoryPresenter
    end
  end
end
