# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Forms::TransactionForm do
  describe '.save' do
    context 'when creating a new transaction' do
      context 'when passing valid params' do
        let(:user) { FactoryBot.create(:user) }
        let(:account) { FactoryBot.create(:account, user_group: user.user_group) }
        let(:budget_item) { FactoryBot.create(:budget_item, user_group: user.user_group) }
        let(:params) do
          ActionController::Parameters.new(
            transaction: {
              budgetExclusion: false,
              checkNumber: nil,
              clearanceDate: Time.current.to_date,
              key: SecureRandom.hex(6),
              notes: nil,
              receipt: nil,
              detailsAttributes: {
                '0' => {
                  key: SecureRandom.hex(6),
                  amount: 100_00,
                  budgetItemKey: budget_item.key,
                },
              },
            }
          )
        end
        let(:transaction_entry) { Transaction::Entry.new(account: account) }

        it 'creates a transaction entry' do
          expect { described_class.new(user, transaction_entry, params).save }
            .to change(Transaction::Entry, :count)
            .by(+1)
        end

        it 'creates the correct number of transaction details' do
          expect { described_class.new(user, transaction_entry, params).save }
            .to change { Transaction::Detail.where(budget_item: budget_item).count }
            .by(+1)
        end

        it 'returns true' do
          subject = described_class.new(user, transaction_entry, params)

          expect(subject.save).to be true
        end
      end
    end

    context 'when updating an existing transaction'
  end
end
