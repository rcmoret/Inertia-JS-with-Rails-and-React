# frozen_string_literal: true

class Transfer < ApplicationRecord
  belongs_to :from_transaction, class_name: 'Transaction::Entry'
  belongs_to :to_transaction, class_name: 'Transaction::Entry'

  after_create :update_transactions!

  scope :recent_first, -> { order(created_at: :desc) }

  def destroy
    update_transactions!(destroy: true)
    super
    transactions.each(&:destroy)
  end

  def to_hash
    attributes.symbolize_keys.merge(
      to_transaction: to_transaction.attributes,
      from_transaction: from_transaction.attributes
    )
  end

  private

  def update_transactions!(destroy: false)
    transfer_id = destroy ? nil : id
    ApplicationRecord.transaction do
      transactions.each { |txn| txn.update(transfer_id: transfer_id) }
    end
  end

  def transactions
    [to_transaction, from_transaction]
  end
end
