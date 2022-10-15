# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Budget::IntervalItemsQuery do
  let(:interval) { FactoryBot.create(:budget_interval) }
  let!(:budget_item) { FactoryBot.create(:budget_item, interval: interval) }
  let(:category) { budget_item.category }

  it 'returns some attributes from the item itself' do
    subject = described_class.new(interval: interval, include_deleted: false).call.first

    expect(subject.deleted_at).to be_nil
    expect(subject.budget_interval_id).to be interval.id
    expect(subject.id).to be budget_item.id
    expect(subject.key).to eq budget_item.key
  end

  it 'returns some attributes from the category' do
    subject = described_class.new(interval: interval, include_deleted: false).call.first

    expect(subject.name).to eq category.name
    expect(subject.accrual).to be category.accrual?
    expect(subject.budget_category_id).to be category.id
    expect(subject.expense).to be category.expense?
    expect(subject.monthly).to be category.monthly?
    expect(subject.is_per_diem_enabled).to be category.is_per_diem_enabled
  end

  it 'returns month and year attributes from the interval' do
    subject = described_class.new(interval: interval, include_deleted: false).call.first

    expect(subject.month).to be interval.month
    expect(subject.year).to be interval.year
  end

  it 'returns the icon class name' do
    subject = described_class.new(interval: interval, include_deleted: false).call.first

    expect(subject.icon_class_name).to be category.icon_class_name
  end
end
