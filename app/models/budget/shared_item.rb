# frozen_string_literal: true

module Budget
  module SharedItem
    extend ActiveSupport::Concern

    included do
      has_many :transaction_details,
               class_name: 'Transaction::Detail',
               foreign_key: :budget_item_id
      has_many :transactions,
               class_name: 'Transaction::DetailView',
               foreign_key: :budget_item_id
      has_many :events, class_name: 'ItemEvent', foreign_key: :budget_item_id
      belongs_to :category, foreign_key: :budget_category_id
      belongs_to :interval,
                 class_name: 'Interval',
                 foreign_key: :budget_interval_id
      has_many :maturity_intervals, through: :category

      scope :in, lambda { |month:, year:|
        where(budget_interval_id: Interval.for(month: month, year: year).id)
      }

      scope :current, -> { where(budget_interval: Interval.current) }
      scope :prior_to, ->(date_hash) { joins(:interval).merge(Interval.prior_to(date_hash)) }
      scope :in_range, ->(range) { joins(:interval).merge(Interval.in_range(range)) }
      scope :active, -> { where(deleted_at: nil) }
      scope :deleted, -> { where.not(deleted_at: nil) }
      scope :revenues, -> { joins(:category).merge(Category.revenues) }
      scope :expenses, -> { joins(:category).merge(Category.expenses) }
      scope :monthly, -> { joins(:category).merge(Category.monthly) }
      scope :weekly, -> { joins(:category).merge(Category.weekly) }
      scope :accruals, -> { joins(:category).merge(Category.accruals) }
      scope :non_accruals, -> { joins(:category).merge(Category.non_accruals) }

      validates :category, presence: true

      delegate :to_json, to: :to_hash
      delegate :per_diem_enabled?, to: :category

      def self.for(key)
        find_by(arel_table[:key].lower.eq(key.downcase))
      end
    end

    def to_hash # rubocop:disable Metrics/MethodLength
      {
        id: id,
        accural: accrual,
        budget_category_id: budget_category_id,
        budget_interval_id: interval.id,
        expense: expense?,
        icon_class_name: icon_class_name,
        month: interval.month,
        name: name,
        year: interval.year,
      }
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
  end
end
