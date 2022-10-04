# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Accounts::WithBalance do
  context 'when there are no accounts associated with the user' do
    let(:user) { FactoryBot.create(:user) }

    it 'returns an empty result set' do
      subject = described_class.new(user_id: user.id).call

      expect(subject).to be_empty
    end
  end

  context 'when there is an account associated with user but no transactions' do
    let(:account) { FactoryBot.create(:account) }
    let(:user) { account.user }

    it 'a result with all the account attributes' do
      subject = described_class.new(user_id: user.id).call.first

      account
        .attributes
        .all? { |key, value| subject.public_send(key) == value }
        .then { |actual| expect(actual).to be true }
    end

    it 'returns balance from the other query :)' do
      date_range = 1.month.ago.to_date..1.day.ago.to_date
      subject = Queries::Accounts::AvailableCash.new(user.id, date_range: date_range).call

      expect(subject).to be_zero
    end

    it 'also returns a zero balance' do
      subject = described_class.new(user_id: user.id).call.first

      expect(subject.balance).to be_zero
    end

    it 'does not return the account for a different user' do
      user
      other_user = FactoryBot.create(:user)

      subject = described_class.new(user_id: other_user.id).call

      expect(subject).to be_empty
    end
  end

  context 'when a user has an account and transactions' do
    let(:account) { FactoryBot.create(:account) }
    let(:user) { account.user }
    let(:transaction_entries) do
      FactoryBot.create_list(:transaction_entry, 2, account: account)
    end

    it 'returns the sum of the transaction details' do
      details_sum = transaction_entries.flat_map(&:details).map(&:amount).sum

      subject = described_class.new(user_id: user.id).call

      expect(subject.first.balance).to eq details_sum
    end
  end

  context 'when a user has an archived account (only)' do
    context 'when calling after initializing with user id only' do
      let(:account) { FactoryBot.create(:account, :archived) }
      let(:user) { account.user }

      it 'returns an empty result set' do
        subject = described_class.new(user_id: user.id).call

        expect(subject).to be_empty
      end
    end

    context 'when calling after initializing with the include archived flag (true)' do
      let(:account) { FactoryBot.create(:account, :archived) }
      let(:user) { account.user }

      it 'returns an empty result set' do
        subject = described_class.new(user_id: user.id, include_archived: true).call

        expect(subject.size).to be 1
      end
    end
  end
end
