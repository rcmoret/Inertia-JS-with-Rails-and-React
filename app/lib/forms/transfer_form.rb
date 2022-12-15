# frozen_string_literal: true

module Forms
  class TransferForm
    include ActiveModel::Model

    validates :to_account, :from_account, presence: true
    validate :separate_accounts
    validates :amount, numericality: { greater_than: 0 }

    def initialize(to_account_id:, from_account_id:, amount:)
      @to_account_id = to_account_id
      @from_account_id = from_account_id
      @amount = amount.to_i.abs
    end

    def call
      return [:error, errors.to_hash] if invalid?

      create!

      return [:error, errors.to_hash] if errors.any?

      [:ok, { transfer: transfer }]
    end

    private

    def create!
      Transfer.transaction do
        { from_transaction: from_transaction, to_transaction: to_transaction, transfer: transfer }.each do |key, model|
          next if model.save

          promote_errors(key, model.errors)
        end

        raise ActiveRecord::Rollback if errors.any?
      end
    end

    def transfer
      @transfer ||= Transfer.new
    end

    def from_transaction
      transfer.build_from_transaction(
        description: "Transfer to #{to_account}",
        account: from_account,
        details_attributes: [{ key: SecureRandom.hex(6), amount: -amount }]
      )
    end

    def to_transaction
      transfer.build_to_transaction(
        description: "Transfer from #{from_account}",
        account: to_account,
        details_attributes: [{ key: SecureRandom.hex(6), amount: amount }]
      )
    end

    attr_reader :to_account_id, :from_account_id, :amount

    def to_account
      @to_account ||= Account.find_by(id: to_account_id)
    end

    def from_account
      @from_account ||= Account.find_by(id: from_account_id)
    end

    def promote_errors(model_name, model_errors)
      model_errors.each do |attribute, message|
        errors.add("#{model_name}.#{attribute}", message)
      end
    end

    def separate_accounts
      return unless to_account_id == from_account_id

      errors.add(:from_account, "cannot be the same account as 'to' account")
    end
  end
end
