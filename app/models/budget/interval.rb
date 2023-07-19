# frozen_string_literal: true

module Budget
  class Interval < ApplicationRecord
    include BelongsToUserGroup
    include Fetchable
    include Presentable

    has_many :items, foreign_key: :budget_interval_id, inverse_of: :interval, dependent: :restrict_with_exception
    has_many :maturity_intervals,
             class_name: 'CategoryMaturityInterval',
             dependent: :destroy,
             inverse_of: :interval,
             foreign_key: :budget_interval_id

    validates :month, presence: true, inclusion: (1..12)
    validates :year, presence: true, inclusion: (2000..2099)
    validates :month, uniqueness: { scope: %i[year user_group_id] }
    validate :close_out_completed_at_end_of_month

    scope :ordered, -> { order(year: :asc).order(month: :asc) }
    scope :desc_ordered, -> { order(year: :desc).order(month: :desc) }

    scope :prior_to, lambda { |date_hash|
      month, year = date_hash.symbolize_keys.values_at(:month, :year)
      where(year: ...year).or(where(year: year, month: ...month))
    }

    # there's some wierdness where I would expect (year: year...)
    # to produce year > $1 in the sql it does not ( >= instead) thus + 1
    scope :on_or_after, lambda { |month:, year:|
      where(year: (year + 1)..).or(where(year: year, month: month..))
    }
    scope :unclosed, -> { where(close_out_completed_at: nil) }

    scope :in_range, lambda { |beginning_month:, beginning_year:, ending_month:, ending_year:|
      if beginning_year > ending_year || (beginning_year == ending_year && beginning_month > ending_month)
        raise QueryError
      end

      if ending_year == beginning_year
        where(year: beginning_year, month: beginning_month..ending_month)
      else
        on_or_after(month: beginning_month, year: beginning_year)
          .prior_to(month: ending_month, year: ending_year)
          .or(where(month: ending_month, year: ending_year))
      end
    }

    class << self
      def for(date_hash)
        find_or_create_by(date_hash)
      end

      def current(user:)
        user_scope = belonging_to_user
        belonging_to_user.where(start_date: ..today, end_date: today..).ordered.take.presence ||
          determine_current(user_scope)
      end

      private

      def determine_current(user_scope)
        potential_interval = user_scope.for(month: today.month, year: today.year)
        return potential_interval.next if potential_interval.last_date < today
        return potential_interval.prev if potential_interval.first_date > today

        potential_interval
      end

      def today
        Date.current.to_date
      end
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

    def prev
      if month > 1
        self.class.where(user_group: user_group).for(month: (month - 1), year: year)
      else
        self.class.where(user_group: user_group).for(month: 12, year: (year - 1))
      end
    end

    def next_month
      if month < 12
        self.class.where(user_group: user_group).for(month: (month + 1), year: year)
      else
        self.class.where(user_group: user_group).for(month: 1, year: (year + 1))
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
