# frozen_string_literal: true

module Budget
  class Interval < ApplicationRecord
    include Presentable
    has_many :items, foreign_key: :budget_interval_id
    has_many :item_views, foreign_key: :budget_interval_id

    validates :month, presence: true, inclusion: (1..12)
    validates :year, presence: true, inclusion: (2000..2099)
    validate :close_out_completed_at_end_of_month

    scope :ordered, -> { order(year: :asc).order(month: :asc) }

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

    # rubocop:disable Metric/BlockLength
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
    # rubocop:enable Metric/BlockLength

    def self.for(**opts)
      month, year =
        if opts[:date].present?
          [opts[:date].to_date.month, opts[:date].to_date.year]
        else
          today = Date.today
          [opts.fetch(:month, today.month), opts.fetch(:year, today.year)]
        end
      find_or_create_by(month: month, year: year)
    end

    def self.current
      unclosed.ordered.take
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
        self.class.for(month: (month - 1), year: year)
      else
        self.class.for(month: 12, year: (year - 1))
      end
    end

    def next_month
      if month < 12
        self.class.for(month: (month + 1), year: year)
      else
        self.class.for(month: 1, year: (year + 1))
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
      return true if date.saturday?
      return true if date.sunday?
      return true if date.day == 1 && (date.month == 1 || date.month == 9)

      false
    end

    QueryError = Class.new(StandardError)
  end
end
