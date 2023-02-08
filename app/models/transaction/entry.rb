# frozen_string_literal: true

module Transaction
  class Entry < ApplicationRecord
    include HasKeyIdentifier
    include Fetchable
    include Presentable

    belongs_to :account
    has_one :debit_transfer,
            class_name: 'Transfer',
            foreign_key: :from_transaction_id,
            dependent: :destroy,
            inverse_of: :from_transaction
    has_one :credit_transfer,
            class_name: 'Transfer',
            foreign_key: :to_transaction_id,
            dependent: :destroy,
            inverse_of: :to_transaction
    has_many :details,
             foreign_key: :transaction_entry_id,
             dependent: :destroy,
             inverse_of: :entry
    accepts_nested_attributes_for :details, allow_destroy: true

    validate :eligible_for_exclusion!, if: :budget_exclusion?
    validate :single_detail!, if: -> { transfer? || budget_exclusion? }
    validate :detail_present!

    has_one_attached :receipt

    scope :belonging_to, ->(user) { joins(:account).merge(Account.belonging_to(user)) }

    scope :cleared, -> { where.not(clearance_date: nil) }
    scope :pending, -> { where(clearance_date: nil) }
    scope :prior_to, ->(date) { cleared.where(arel_table[:clearance_date].lt(date)) }
    scope :in, ->(range) { where(clearance_date: range) }
    scope :between, ->(range, include_pending: false) { include_pending ? self.in(range).or(pending) : self.in(range) }
    scope :budget_inclusions, -> { where(budget_exclusion: false) }
    scope :cash_flow, -> { joins(:account).merge(Account.cash_flow) }
    scope :non_cash_flow, -> { joins(:account).merge(Account.non_cash_flow) }

    delegate :name, to: :account, prefix: true

    def self.total
      joins(:details).sum(:amount)
    end

    def total
      details.sum(:amount)
    end

    def transfer
      credit_transfer || debit_transfer
    end

    def transfer?
      [credit_transfer, debit_transfer].any?
    end

    private

    def eligible_for_exclusion!
      if account.cash_flow?
        errors.add(:budget_exclusion,
                   'Budget Exclusions only applicable for non-cashflow accounts')
      end

      return if details.all? { |detail| detail.budget_item.nil? }

      errors.add(:budget_exclusion,
                 'Budget Exclusions cannot be associated with a budget item')
    end

    def single_detail!
      return if details.size == 1

      if details.none?
        record_no_details!
      else
        record_multiple_details!
      end
    end

    def record_multiple_details!
      if transfer?
        errors.add(:transfer,
                   'Cannot have multiple details for transfer')
      else # budget_exclusion
        errors.add(:budget_exclusion,
                   'Cannot have multiple details for budget exclusion')
      end
    end

    def detail_present!
      return if details.any?

      record_no_details!
    end

    def record_no_details!
      if transfer? || budget_exclusion?
        errors.add(
          :details,
          'This type of transaction '\
          "(#{transfer? ? :transfer : :budget_exclusion}) "\
          'must have exactly 1 detail'
        )
      else # non-tranfer; budget included
        errors.add(:details, 'Must have at least one detail for this entry')
      end
    end

    def presenter_class
      Presenters::Transactions::EntryPresenter
    end
  end
end
