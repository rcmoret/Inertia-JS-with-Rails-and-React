# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Budget::ItemEventsQuery do
  context 'when there are no events' do
    let(:user) { FactoryBot.create(:user) }
    let(:budget_interval) do
      FactoryBot.create(:budget_interval).tap { |interval| interval.user_id = user.id }
    end
    let(:budget_item) { FactoryBot.create(:budget_item, interval: budget_interval) }

    it 'returns an empty collection' do
      subject = described_class.new(
        month: budget_interval.month,
        year: budget_interval.year,
        user_id: budget_interval.user_id
      ).call

      expect(subject.fetch(budget_item.id).collection).to be_empty
    end

    it 'returns zero for the amount' do
      subject = described_class.new(
        month: budget_interval.month,
        year: budget_interval.year,
        user_id: budget_interval.user_id
      ).call

      expect(subject.fetch(budget_item.id).amount).to be_zero
    end
  end

  context 'when an item has events' do
    let(:user) { FactoryBot.create(:user) }
    let(:budget_interval) do
      FactoryBot.create(:budget_interval).tap { |interval| interval.user_id = user.id }
    end
    let(:budget_item) { FactoryBot.create(:budget_item, interval: budget_interval) }
    let!(:events) do
      [
        FactoryBot.create(:budget_item_event, :create_event, item: budget_item),
        *FactoryBot.create_list(:budget_item_event, 2, :adjust_event, item: budget_item),
      ]
    end

    it "returns the sum of events' amount attribute" do
      subject = described_class.new(
        month: budget_interval.month,
        year: budget_interval.year,
        user_id: budget_interval.user_id
      ).call

      expect(subject.fetch(budget_item.id).amount).to be events.sum(&:amount)
    end

    it 'returns a collection of events' do
      subject = described_class.new(
        month: budget_interval.month,
        year: budget_interval.year,
        user_id: budget_interval.user_id
      ).call

      expected_collection = events.map do |event|
        {
          id: event.id,
          created_at: event.created_at.strftime('%FT%T.%6N').sub(/\.?0+$/, ''),
          amount: event.amount,
          type_description: event.type.name,
          data: nil,
        }
      end

      expect(subject.fetch(budget_item.id).collection.map(&:to_h))
        .to contain_exactly(*expected_collection)
    end
  end
end
