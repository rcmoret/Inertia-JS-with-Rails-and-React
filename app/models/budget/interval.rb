# frozen_string_literal: true

module Budget
  # rubocop:disable Metrics/ClassLength
  class Interval < ActiveRecord::Base
    has_many :items, foreign_key: :budget_interval_id
    has_many :item_views, foreign_key: :budget_interval_id

    validates :month, presence: true, inclusion: (1..12)
    validates :year, presence: true, inclusion: (2000..2099)
    validate :close_out_completed_at_end_of_month
    before_save :update_start_and_end_date!, if: -> { set_up_completed_at_changed? }

    PUBLIC_ATTRS = %i[close_out_completed_at set_up_completed_at].freeze

    scope :ordered, -> { order(year: :asc).order(month: :asc) }

    scope :prior_to, lambda { |date_hash|
      query =  '"budget_intervals"."year" < :year OR '
      query += '("budget_intervals"."month" < :month AND "budget_intervals"."year" = :year)'
      where(query, date_hash)
    }

    # rubocop:disable Metric/BlockLength
    scope :in_range, lambda { |beginning_month:, beginning_year:, ending_month:, ending_year:|
      if beginning_year > ending_year || (beginning_year == ending_year && beginning_month > ending_month)
        raise QueryError
      end

      if ending_year == beginning_year
        where('"budget_intervals".year = ? AND "budget_intervals".month >= ? AND "budget_intervals".month <= ?',
              beginning_year, beginning_month, ending_month)
      elsif ending_year - beginning_year > 1
        where('"budget_intervals".year = ? AND "budget_intervals".month >= ?', beginning_year, beginning_month)
          .or(where('"budget_intervals".year = ? AND "budget_intervals".month <= ?', ending_year, ending_month))
          .or(where(year: ((beginning_year + 1)...ending_year)))
      else
        where('"budget_intervals".year = ? AND "budget_intervals".month >= ?', beginning_year, beginning_month)
          .or(where('"budget_intervals".year = ? AND "budget_intervals".month <= ?', ending_year, ending_month))
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
      self.for
    end

    def set_up?
      set_up_completed_at.present?
    end

    def closed_out?
      close_out_completed_at.present?
    end

    def first_date
      return start_date if start_date.present?

      prev.last_date + 1.day
    end

    def last_date
      return end_date if end_date.present?

      last = Date.new(year, month, -1)
      last -= 1.day while last.saturday? || last.sunday?
      last - 1.day
    end

    def current?
      !closed_out? && prev.closed_out?
    end

    def total_days
      (last_date - first_date).to_i + 1
    end

    def days_remaining
      if current?
        (last_date - today + 1).to_i
      elsif closed_out?
        0
      else
        total_days
      end
    end

    def date_range
      first_date..last_date
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

    def today
      @today ||= Date.today
    end

    def close_out_completed_at_end_of_month
      return if close_out_completed_at.nil?
      return if close_out_completed_at >= last_date

      errors.add(:close_out_completed_at, 'Must be on or after the last day of the month')
    end

    def update_start_and_end_date!
      self[:start_date] ||= first_date
      self[:end_date] ||= last_date
    end

    QueryError = Class.new(StandardError)
  end
  # rubocop:enable Metrics/ClassLength
end
