# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Forms::TransferForm do
  subject do
    described_class.new(
      user: user,
      params: {
        to_account_slug: to_account.slug,
        from_account_slug: from_account.slug,
        amount: amount,
      }
    )
  end

  let(:user) { FactoryBot.create(:user) }

  describe 'validations' do
    context 'when the "to" account is not present' do
      let(:to_account) { FactoryBot.create(:account, user_group: user.user_group) }
      let(:from_account) { FactoryBot.create(:account, user_group: user.user_group) }
      let(:amount) { rand(100..1000) }

      before do
        allow(Account).to receive(:fetch).with(user: user, identifier: to_account.slug).and_return(nil)
        allow(Account).to receive(:fetch).with(user: user, identifier: from_account.slug).and_call_original
      end

      it 'returns an error tuple' do
        expect(subject.call).to match([:error, hash_including(to_account: ["can't be blank"])])
      end
    end

    context 'when the "from" account is not present' do
      let(:to_account) { FactoryBot.create(:account) }
      let(:from_account) { FactoryBot.create(:account) }
      let(:amount) { rand(100..1000) }

      before do
        allow(Account).to receive(:fetch).with(user: user, identifier: to_account.slug).and_return(to_account)
        allow(Account).to receive(:fetch).with(user: user, identifier: from_account.slug).and_return(nil)
      end

      it 'returns an error tuple' do
        expect(subject.call).to match([:error, hash_including(from_account: ["can't be blank"])])
      end
    end

    context 'when the both account ids are the same' do
      let(:to_account) { FactoryBot.create(:account, user_group: user.user_group) }
      let(:from_account) { to_account }
      let(:amount) { rand(100..1000) }

      it 'returns an error tuple' do
        expect(subject.call)
          .to eq([:error, { from_account: ["cannot be the same account as 'to' account"] }])
      end
    end

    context 'when the amount is zero' do
      let(:to_account) { FactoryBot.create(:account) }
      let(:from_account) { FactoryBot.create(:account) }
      let(:amount) { 0 }

      it 'returns an error tuple' do
        expect(subject.call).to match([:error, hash_including(amount: ['must be greater than 0'])])
      end
    end

    context 'when the amount is a negative number' do
      let(:to_account) { FactoryBot.create(:account, user_group: user.user_group) }
      let(:from_account) { FactoryBot.create(:account, user_group: user.user_group) }
      let(:amount) { -1 * rand(100..1000) }

      it 'returns an :ok tuple' do
        expect(subject.call).to match([:ok, anything])
      end

      it 'creates a new transaction entry for the to account' do
        expect { subject.call }.to change { Transaction::Entry.where(account_id: to_account.id).count }.by(+1)
      end

      it 'creates a new transaction entry for the from account' do
        expect { subject.call }.to change { Transaction::Entry.where(account_id: from_account.id).count }.by(+1)
      end

      it 'creates a new transfer' do
        expect { subject.call }.to change(Transfer, :count).by(+1)
      end
    end
  end
end
