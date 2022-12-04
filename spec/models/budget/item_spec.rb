# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Item, type: :model do
  xit { is_expected.to belong_to(:category).required }
  xit { is_expected.to belong_to(:interval).required }
  it { is_expected.to have_many(:transaction_details) }
  it { is_expected.to delegate_method(:name).to(:category) }
  it { is_expected.to delegate_method(:icon_class_name).to(:category) }
  it { is_expected.to delegate_method(:expense?).to(:category) }
  it { is_expected.to delegate_method(:monthly?).to(:category) }

  describe 'key validations' do
    subject { FactoryBot.build(:budget_item) }

    it { is_expected.to validate_uniqueness_of(:key) }
    it { is_expected.to validate_presence_of(:key) }
  end

  describe 'validation of uniqueness for weekly items per interval' do
    specify do
      budget_interval = FactoryBot.create(:budget_interval)
      category = FactoryBot.create(:category, :weekly)
      FactoryBot.create(:budget_item, category: category, interval: budget_interval)

      subject = FactoryBot.build(:budget_item, category: category, interval: budget_interval)

      expect(subject).to be_invalid
    end
  end

  context 'when deleting an item' do
    before { travel_to Time.current }

    after { travel_back }

    context 'when transaction details are present' do
      it 'raises an error' do
        transaction_detail = FactoryBot.create(:transaction_detail)
        subject = transaction_detail.budget_item

        expect { subject.delete }.to raise_error(described_class::NonDeleteableError)
      end
    end

    context 'when transaction details are not present' do
      it 'updates the deleted at time stamp' do
        subject = FactoryBot.create(:budget_item)

        expect { subject.delete }
          .to(change { subject.reload.deleted_at }.from(nil).to(Time.current))
      end
    end
  end

  describe '.for' do
    let(:budget_item) { FactoryBot.create(:budget_item) }

    context 'when passing an upcased version of the key' do
      let(:key) { budget_item.key.upcase }

      it 'returns the item' do
        subject = described_class.for(key)

        expect(subject).to eq budget_item
      end
    end

    context 'when passing an down-cased version of the key' do
      let(:key) { budget_item.key.downcase }

      it 'returns the item' do
        subject = described_class.for(key)

        expect(subject).to eq budget_item
      end
    end

    context 'when passing a key that does not map to an item' do
      let(:key) { SecureRandom.hex(6) }

      it 'returns the item' do
        subject = described_class.for(key)

        expect(subject).to be nil
      end
    end
  end
end
