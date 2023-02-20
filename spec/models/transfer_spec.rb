# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transfer, type: :model do
  it { is_expected.to belong_to(:from_transaction) }
  it { is_expected.to belong_to(:to_transaction) }

  describe 'after_create :update_transactions' do
    let(:transfer) { FactoryBot.create(:transfer) }

    it 'adds its id to the transactions' do
      expect { transfer }.to change { Transaction::Entry.count }.by(2)
    end
  end

  describe 'destroy' do
    subject { transfer.destroy }

    let!(:transfer) { FactoryBot.create(:transfer) }

    it 'destroys the related transactions' do
      expect { subject }.to change { Transaction::Entry.count }.by(-2)
    end

    it 'destroys itself' do
      subject
      expect(transfer).to be_destroyed
    end
  end
end
