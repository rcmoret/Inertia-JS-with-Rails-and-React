# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transfer, type: :model do
  it { should belong_to(:from_transaction) }
  it { should belong_to(:to_transaction) }

  describe 'after_create :update_transactions' do
    let(:transfer) { FactoryBot.create(:transfer) }
    it 'adds its id to the transactions' do
      expect { transfer }.to change {
        Transaction::Entry.where.not(transfer_id: nil).count
      }.by(2)
    end
  end

  describe '.to_hash' do
    let(:checking_account) { FactoryBot.create(:account) }
    let(:savings_account) { FactoryBot.create(:savings_account) }
    let(:amount) { (100..1000).to_a.sample }
    let(:transfer_form) do
      Forms::TransferForm.new(
        from_account_id: checking_account.id,
        to_account_id: savings_account.id,
        amount: amount
      )
    end
    let(:transfer) do
      case transfer_form.call
      in [:ok, { transfer: transfer }]
        transfer
      end
    end

    subject { transfer.to_hash }

    it 'includes the transfer id' do
      expect(subject[:id]).to be transfer.id
    end

    it 'includes the to_transaction_id' do
      expect(subject[:to_transaction_id]).to be transfer.to_transaction.id
    end

    it 'includes the from_transaction_id' do
      expect(subject[:from_transaction_id]).to be transfer.from_transaction.id
    end

    it 'includes the to_transaction as a hash' do
      expect(subject[:to_transaction][:details].first[:amount]).to be amount
      expect(subject[:to_transaction][:account_name]).to eq savings_account.name
    end

    it 'includes the from_transaction as a hash' do
      expect(subject[:from_transaction][:details].first[:amount])
        .to be(amount * -1)
      expect(subject[:from_transaction][:account_name])
        .to eq checking_account.name
    end
  end

  describe 'destroy' do
    let!(:transfer) { FactoryBot.create(:transfer) }
    subject { transfer.destroy }
    it 'destroys the related transactions' do
      expect { subject }.to change { Transaction::Entry.count }.by(-2)
    end

    it 'destroys itself' do
      subject
      expect(transfer).to be_destroyed
    end
  end
end
