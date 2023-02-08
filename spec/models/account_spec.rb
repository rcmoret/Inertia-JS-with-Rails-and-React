# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Account, type: :model do
  it { is_expected.to have_many(:transactions) }
  xit { is_expected.to have_many(:transaction_views) }

  describe 'activereocord validations' do
    subject { FactoryBot.build(:account) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:priority) }
    it { is_expected.to validate_uniqueness_of(:priority).scoped_to(:user_group_id) }
    it { is_expected.to validate_uniqueness_of(:name).scoped_to(:user_group_id) }
    it { is_expected.to validate_uniqueness_of(:slug).scoped_to(:user_group_id) }
  end

  describe 'slug format validation' do
    subject { FactoryBot.build(:account) }

    context 'when it is all lower case with a dash' do
      it 'is valid' do
        account = FactoryBot.build(:account, slug: 'bank-acct')
        expect(account.valid?).to be true
      end
    end

    context 'when it is has uppercase' do
      it 'is valid' do
        account = FactoryBot.build(:account, slug: 'bankAcct')
        expect(account.valid?).to be false
        expect(account.errors[:slug])
          .to include 'must be combination of lowercase letters, numbers and dashes'
      end
    end
  end

  describe '#destroy' do
    subject { account.destroy }

    let(:account) { FactoryBot.create(:account) }

    context 'when transactions exist' do
      before { FactoryBot.create(:transaction_entry, account: account) }

      it 'soft deletes the account' do
        expect { subject }.to(change { account.reload.archived_at })
      end

      it 'does not change the number of accounts' do
        expect { subject }.not_to change(described_class, :count)
      end
    end

    context 'when no transactions exist' do
      before { account }

      it 'hard deletes the account' do
        expect { subject }.to change(described_class, :count).by(-1)
      end
    end
  end
end
