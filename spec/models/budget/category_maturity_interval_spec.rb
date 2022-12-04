# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::CategoryMaturityInterval, type: :model do
  it { is_expected.to delegate_method(:month).to(:interval) }
  it { is_expected.to delegate_method(:year).to(:interval) }

  describe 'belongs to' do
    subject { described_class.new(category: category, interval: interval) }

    let(:category) { FactoryBot.create(:category, :accrual) }
    let(:interval) { FactoryBot.create(:budget_interval) }

    it { is_expected.to belong_to(:interval) }
    xit { is_expected.to belong_to(:category) }
  end

  describe 'requires interval and catgory' do
    context 'when the budget interval is null' do
      subject { described_class.new(category: category, interval: nil) }

      let(:category) { FactoryBot.create(:category, :accrual) }

      it 'raises an error' do
        expect { subject.save! }.to raise_error ActiveRecord::RecordInvalid
      end
    end

    context 'when the budget category is null' do
      subject { described_class.new(category: nil, interval: interval) }

      let(:interval) { FactoryBot.create(:budget_interval) }

      it 'raises an error' do
        expect { subject.save! }.to raise_error NoMethodError
      end
    end
  end

  describe 'uniqueness validation' do
    subject { record.valid? }

    let(:interval) { FactoryBot.create(:budget_interval) }
    let(:category) { FactoryBot.create(:category, :accrual) }
    let(:record) { FactoryBot.build(:maturity_interval, interval: interval, category: category) }

    before { FactoryBot.create(:maturity_interval, interval: interval, category: category) }

    it 'returns false' do
      expect(subject).to be false
    end
  end

  describe 'accrual validation' do
    subject { record.valid? }

    context 'when the category is not an accrual' do
      let(:interval) { FactoryBot.build(:budget_interval) }
      let(:category) { FactoryBot.build(:category) }
      let(:record) do
        described_class.new(interval: interval, category: category)
      end

      it 'returns false' do
        expect(subject).to be false
      end
    end

    context 'when the category is an accrual' do
      let(:interval) { FactoryBot.build(:budget_interval) }
      let(:category) { FactoryBot.build(:category, :accrual) }
      let(:record) do
        described_class.new(interval: interval, category: category)
      end

      it 'returns true' do
        expect(subject).to be true
      end
    end
  end
end
