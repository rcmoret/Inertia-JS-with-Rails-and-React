# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Category, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:items) }
    it { is_expected.to have_many(:transaction_details) }
    it { is_expected.to belong_to(:icon).required(false) }
    it { is_expected.to have_many(:maturity_intervals) }
    it { is_expected.to have_many(:events).through(:items) }
  end

  describe 'validations' do
    subject { FactoryBot.create(:category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }

    describe 'accrual on expense' do
      subject { FactoryBot.build(:category, :revenue, :accrual) }

      it { is_expected.not_to be_valid }

      it "populates the object's errors" do
        subject.valid?
        expect(subject.errors[:accrual]).to \
          include 'can only be enabled for expenses'
      end
    end
  end

  describe '#revenue?' do
    subject { category.revenue? }

    let(:category) { FactoryBot.create(:category, expense?) }

    context 'when category is revenue' do
      let(:expense?) { :revenue }

      it { is_expected.to be true }
    end

    context 'when category is expense' do
      let(:expense?) { :expense }

      it { is_expected.to be false }
    end
  end

  describe '#weekly?' do
    subject { category.weekly? }

    let(:category) { FactoryBot.create(:category, monthly: monthly?) }

    context 'when category is weekly' do
      let(:monthly?) { false }

      it { is_expected.to be true }
    end

    context 'when category is monthly' do
      let(:monthly?) { true }

      it { is_expected.to be false }
    end
  end

  describe '#to_hash' do
    subject { category.to_hash }

    let(:category) { FactoryBot.create(:category) }

    it 'returns a simplified hash' do
      expected_hash = category.attributes.symbolize_keys.except(
        :updated_at, :created_at
      ).merge(icon_class_name: nil)
      expect(subject).to include expected_hash
    end
  end

  describe '#archived?' do
    subject { category.archived? }

    let(:category) { FactoryBot.create(:category, archived_at: archived_at) }

    context 'when category was archived' do
      let(:archived_at) { 1.day.ago }

      it { is_expected.to be true }
    end

    context 'when the category was not archived' do
      let(:archived_at) { nil }

      it { is_expected.to be false }
    end
  end

  describe 'archiving/unarchiving' do
    before { Timecop.freeze }

    after { Timecop.return }

    let(:category) { FactoryBot.create(:category) }

    describe '#archive!' do
      subject { category.archive! }

      before { allow(category).to receive(:update) }

      it 'calls update' do
        expect(category).to receive(:update).with(archived_at: Time.current)
        subject
      end
    end

    describe '#unarchive!' do
      subject { category.unarchive! }

      before { allow(category).to receive(:update) }

      it 'calls update' do
        expect(category).to receive(:update).with(archived_at: nil)
        subject
      end
    end
  end

  describe 'destroy' do
    subject { category.destroy }

    let!(:category) { FactoryBot.create(:category) }

    before { Timecop.freeze }

    after { Timecop.return }

    context 'when there are no associated items' do
      it 'deletes the record' do
        expect { subject }.to change(described_class, :count).by(-1)
      end
    end

    context 'when there are associated items' do
      before do
        FactoryBot.create(:budget_item, category: category)
        allow(category).to receive(:update).and_call_original
      end

      it 'soft deletes the record' do
        expect(category).to receive(:update).with(archived_at: Time.current)
        expect { subject }.not_to(change(described_class, :count))
      end
    end
  end
end
