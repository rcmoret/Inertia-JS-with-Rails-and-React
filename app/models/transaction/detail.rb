# frozen_string_literal: true

module Transaction
  class Detail < ActiveRecord::Base
    belongs_to :budget_item, class_name: 'Budget::Item', optional: true
    belongs_to :entry,
               optional: false,
               foreign_key: :transaction_entry_id
    has_one :account, through: :entry
    has_one :view,
            class_name: 'DetailView',
            foreign_key: :id,
            primary_key: :id
    validates :amount, presence: true
    validates :budget_item_id, uniqueness: true, if: :budget_item_monthly?
    validate :amount_static!, if: :transfer?, on: :update

    scope :discretionary, -> { where(budget_item_id: nil) }
    scope :prior_to, ->(date) { joins(:entry).merge(Entry.prior_to(date)) }
    scope :pending, -> { joins(:entry).merge(Entry.pending) }
    scope :budget_inclusions, -> { joins(:entry).merge(Entry.budget_inclusions) }
    scope :for_accounts, lambda { |account_ids|
      joins(:entry).where(transaction_entries: { account_id: account_ids })
    }

    delegate :monthly?, to: :budget_item, allow_nil: true, prefix: true
    delegate :transfer?, to: :entry

    PUBLIC_ATTRS = %w[
      id
      amount
      budget_item_id
      _destroy
    ].freeze

    def self.total
      sum(:amount)
    end

    def self.balances_for(account_ids)
      for_accounts(account_ids).group('transaction_entries.account_id').sum(:amount)
    end

    private

    def amount_static!
      return unless amount_changed?

      errors.add(:amount, 'Cannot be changed for a transfer')
    end
  end
end
