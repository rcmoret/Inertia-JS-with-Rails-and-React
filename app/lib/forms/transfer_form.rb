# frozen_string_literal: true

module Forms
  class TransferForm
    include ActiveModel::Model

    validates :to_account, :from_account, presence: true
    validate :separate_accounts
    validates :amount, numericality: { greater_than: 0 }

    def initialize(user:, params:)
      @user = user
      @to_account_slug = params.fetch(:to_account_slug)
      @from_account_slug = params.fetch(:from_account_slug)
      @amount = params.fetch(:amount).to_i.abs
      @key = params.fetch(:key) { generate_key_indentifier }
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
      @transfer ||= Transfer.new(key: key)
    end

    def from_transaction
      transfer.build_from_transaction(
        description: "Transfer to #{to_account}",
        account: from_account,
        key: generate_key_indentifier,
        details_attributes: [{ key: generate_key_indentifier, amount: -amount }]
      )
    end

    def to_transaction
      transfer.build_to_transaction(
        description: "Transfer from #{from_account}",
        account: to_account,
        key: generate_key_indentifier,
        details_attributes: [{ key: generate_key_indentifier, amount: amount }]
      )
    end

    attr_reader :user, :to_account_slug, :from_account_slug, :amount, :key

    def to_account
      @to_account ||= Account.fetch(user: user, identifier: to_account_slug)
    end

    def from_account
      @from_account ||= Account.fetch(user: user, identifier: from_account_slug)
    end

    def promote_errors(model_name, model_errors)
      model_errors.each do |attribute, message|
        errors.add("#{model_name}.#{attribute}", message)
      end
    end

    def separate_accounts
      return unless to_account&.id == from_account&.id

      errors.add(:from_account, "cannot be the same account as 'to' account")
    end

    def generate_key_indentifier
      SecureRandom.hex(6)
    end
  end
end
