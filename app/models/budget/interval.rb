# frozen_string_literal: true

module Budget
  class Interval < ApplicationRecord
    include Presentable
    belongs_to :user
    has_many :items, foreign_key: :budget_interval_id, inverse_of: :interval, dependent: :restrict_with_exception
    has_many :maturity_intervals,
             class_name: 'CategoryMaturityInterval',
             dependent: :destroy,
             inverse_of: :interval,
             foreign_key: :budget_interval_id
    has_many :item_views, foreign_key: :budget_interval_id, inverse_of: :interval, dependent: :restrict_with_exception
    belongs_to :user

    validates :month, presence: true, inclusion: (1..12)
    validates :year, presence: true, inclusion: (2000..2099)
    validates :month, uniqueness: { scope: %i[year user_id] }
    validate :close_out_completed_at_end_of_month

    scope :ordered, -> { order(year: :asc).order(month: :asc) }
    scope :belonging_to, ->(user) { where(user: user) }

    scope :prior_to, lambda { |date_hash|
      month, year = date_hash.symbolize_keys.values_at(:month, :year)
      where(year: ...year).or(where(year: year, month: ...month))
    }

    # there's some wierdness where I would expect (year: year...)
    # to produce year > $1 in the sql it does not ( >= instead) thus + 1
    scope :on_or_after, lambda { |month, year|
      where(year: (year + 1)..).or(where(year: year, month: month..)).ordered
    }
    scope :unclosed, -> { where(close_out_completed_at: nil) }

    # rubocop:disable Metrics/BlockLength
    scope :in_range, lambda { |beginning_month:, beginning_year:, ending_month:, ending_year:|
      if beginning_year > ending_year || (beginning_year == ending_year && beginning_month > ending_month)
        raise QueryError
      end

      if ending_year == beginning_year
        where(year: beginning_year, month: beginning_month..ending_month)
      elsif ending_year - beginning_year > 1
        where(year: beginning_year, month: ..beginning_month)
          .or(where(year: ending_year, month: ..ending_month))
          .or(where(year: (beginning_year + 1)...ending_year))
      else
        where(year: beginning_year, month: beginning_month..)
          .or(where(year: ending_year, month: ..ending_month))
      end
    }
    # rubocop:enable Metrics/BlockLength

    def self.for(month:, year:, user_id:)
      find_or_create_by(month: month, year: year, user_id: user_id)
    end

    def self.current(user:)
      belonging_to(user).unclosed.ordered.take
    end

    def set_up?
      set_up_completed_at.present?
    end

    def first_date
      return start_date if start_date.present?

      DateTime.new(year, month, 1).then do |first|
        first -= 1.day while weekend_or_holiday?(first)
        first
      end
    end

    def last_date
      return end_date if end_date.present?

      next_month.first_date - 1.day
    end

    def date_hash
      { month: month, year: year }
    end

    def attributes
      super.symbolize_keys.except(:created_at, :updated_at)
    end

    def prev
      if month > 1
        self.class.for(month: (month - 1), year: year, user_id: user_id)
      else
        self.class.for(month: 12, year: (year - 1), user_id: user_id)
      end
    end

    def next_month
      if month < 12
        self.class.for(month: (month + 1), year: year, user_id: user_id)
      else
        self.class.for(month: 1, year: (year + 1), user_id: user_id)
      end
    end
    alias next next_month

    private

    def close_out_completed_at_end_of_month
      return if close_out_completed_at.nil?
      return if close_out_completed_at >= last_date

      errors.add(:close_out_completed_at, 'Must be on or after the last day of the month')
    end

    def presenter_class
      Presenters::Budget::IntervalPresenter
    end

    def weekend_or_holiday?(date)
      date.saturday? || date.sunday? || holiday?(date)
    end

    def holiday?(date)
      # always adjust for New Year's Day
      return true if date.month == 1 && date.day == 1
      # adjust for labor day if it falls on the first
      return true if date.month == 9 && date.day == 1 && date.monday?

      false
    end

    QueryError = Class.new(StandardError)
  end
end
