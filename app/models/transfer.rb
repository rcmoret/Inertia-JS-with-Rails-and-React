# frozen_string_literal: true

class Transfer < ApplicationRecord
  include HasKeyIdentifier

  belongs_to :from_transaction, class_name: 'Transaction::Entry'
  belongs_to :to_transaction, class_name: 'Transaction::Entry'

  after_destroy :destroy_transactions!

  scope :recent_first, -> { order(created_at: :desc) }

  def self.belonging_to(transaction)
    where(from_transaction: transaction).or(where(to_transaction: transaction)).first
  end

  private

  def destroy_transactions!
    transactions.each(&:destroy)
  end

  def transactions
    [to_transaction, from_transaction]
  end
end
