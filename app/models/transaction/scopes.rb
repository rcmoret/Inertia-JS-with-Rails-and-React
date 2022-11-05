# frozen_string_literal: true

module Transaction
  module Scopes
    extend ActiveSupport::Concern
    included do
      scope :cleared, -> { where.not(clearance_date: nil) }
      scope :pending, -> { where(clearance_date: nil) }
      scope :prior_to, ->(date) { cleared.where(arel_table[:clearance_date].lt(date)) }
      scope :in, ->(range) { where(clearance_date: range) }
      scope :between, lambda { |range, include_pending: false|
        include_pending ? self.in(range).or(pending) : self.in(range)
      }
      scope :budget_inclusions, -> { where(budget_exclusion: false) }
      scope :non_transfers, -> { where(transfer_id: nil) }
      scope :cash_flow, -> { joins(:account).merge(Account.cash_flow) }
      scope :non_cash_flow, -> { joins(:account).merge(Account.non_cash_flow) }
      scope :for, ->(user) { joins(:account).merge(Account.for(user)) }
    end
  end
end
