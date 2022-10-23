# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Budget::IntervalItems do
  describe '#call' do
    let(:user) { FactoryBot.create(:user) }
    let(:account) { FactoryBot.create(:account, name: 'Checking Account') }
    let(:budget_interval) do
      FactoryBot.create(:budget_interval, :current).tap { |interval| interval.user_id = user.id }
    end
    let(:groceries) { FactoryBot.create(:category, :weekly, :with_icon, name: 'Groceries') }
    let(:rent) { FactoryBot.create(:category, :monthly, :accrual, :with_icon, name: 'Rent') }
    let(:rent_item) do
      FactoryBot.create(:budget_item, category: rent, interval: budget_interval)
    end
    let(:grocery_item) do
      FactoryBot.create(:budget_item, category: groceries, interval: budget_interval)
    end
    let!(:grocery_events) do
      [
        FactoryBot.create(:budget_item_event, :create_event, item: grocery_item),
        FactoryBot.create(:budget_item_event, :adjust_event, item: grocery_item),
      ]
    end
    let!(:rent_events) do
      [FactoryBot.create(:budget_item_event, :create_event, item: rent_item)]
    end
    let!(:grocery_transaction_entries) do
      FactoryBot.create_list(:transaction_entry,
                             2,
                             description: 'Publix',
                             account: account,
                             clearance_date: 2.days.ago,
                             details_attributes: [{ amount: -100_00, budget_item: grocery_item }])
    end
    let(:future_interval) do
      FactoryBot.create(:budget_interval, month: budget_interval.month, year: (budget_interval.year + 1))
                .tap { |interval| interval.user_id = user.id }
    end
    let!(:maturity_interval) do
      FactoryBot.create(:maturity_interval, category: rent, interval: future_interval)
    end

    describe 'the first entry (groceries)' do
      it "returns the budget item's attributes, also many category attrs" do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.size).to be 2
        expect(subject.first.id).to be grocery_item.id
        expect(subject.first.name).to eq groceries.name
        expect(subject.first.key).to eq grocery_item.key
        expect(subject.first.budget_category_id).to be groceries.id
        expect(subject.first.monthly).to be groceries.monthly?
        expect(subject.first.expense).to be groceries.expense?
        expect(subject.first.accrual).to be groceries.accrual?
        expect(subject.first.is_per_diem_enabled).to be groceries.is_per_diem_enabled?
        expect(subject.first.icon_class_name).to eq groceries.icon.class_name
        expect(subject.first.month).to be budget_interval.month
        expect(subject.first.year).to be budget_interval.year
        expect(subject.first.upcoming_maturity_interval).to eq({ month: nil, year: nil })
      end

      it 'returns an array of events' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expected_events = grocery_events.map do |event|
          {
            id: event.id,
            amount: event.amount,
            created_at: event.created_at.strftime('%FT%T.%6N').sub(/\.?0+$/, ''),
            type_description: event.type.name,
            data: nil,
          }
        end

        expect(subject.first.events.map(&:to_h))
          .to contain_exactly(*expected_events)
      end

      it 'returns an amount which is the sum of event amounts' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.first.amount).to be grocery_events.sum(&:amount)
      end

      it 'returns an array of transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expected_details = grocery_transaction_entries.flat_map do |entry|
          entry.details.map do |detail|
            {
              id: detail.id,
              amount: detail.amount,
              account_name: account.name,
              description: entry.description,
              clearance_date: entry.clearance_date.strftime('%F'),
              updated_at: detail.updated_at.strftime('%FT%T.%6N').sub(/\.?0+$/, ''),
            }
          end
        end

        expect(subject.first.transaction_details.map(&:to_h)).to contain_exactly(*expected_details)
      end

      it 'returns the count of transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.first.transactions_count)
          .to be grocery_transaction_entries.flat_map(&:details).size
      end

      it 'returns the sum of the transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expected_sum = grocery_transaction_entries.flat_map(&:details).sum(&:amount)

        expect(subject.first.transactions_total).to be expected_sum
      end
    end

    describe 'the second entry (rent)' do
      it "returns the budget item's attributes, also many category attrs" do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.size).to be 2
        expect(subject.last.id).to be rent_item.id
        expect(subject.last.name).to eq rent.name
        expect(subject.last.key).to eq rent_item.key
        expect(subject.last.budget_category_id).to be rent.id
        expect(subject.last.monthly).to be rent.monthly?
        expect(subject.last.expense).to be rent.expense?
        expect(subject.last.accrual).to be rent.accrual?
        expect(subject.last.is_per_diem_enabled).to be rent.is_per_diem_enabled?
        expect(subject.last.icon_class_name).to eq rent.icon.class_name
        expect(subject.last.month).to be budget_interval.month
        expect(subject.last.year).to be budget_interval.year
        expect(subject.last.upcoming_maturity_interval).to eq({ month: future_interval.month, year: future_interval.year })
      end

      it 'returns an array of events' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expected_events = rent_events.map do |event|
          {
            id: event.id,
            amount: event.amount,
            created_at: event.created_at.strftime('%FT%T.%6N').sub(/\.?0+$/, ''),
            type_description: event.type.name,
            data: nil,
          }
        end

        expect(subject.last.events.map(&:to_h))
          .to contain_exactly(*expected_events)
      end

      it 'returns an amount which is the sum of event amounts' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.last.amount).to be rent_events.sum(&:amount)
      end

      it 'returns an array of transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.last.details).to be_blank
      end

      it 'returns the count of transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.last.transactions_count).to be_zero
      end

      it 'returns the sum of the transaction details' do
        subject = described_class.new(
          month: budget_interval.month,
          year: budget_interval.year,
          include_deleted: false,
          user_id: budget_interval.user_id
        ).call

        expect(subject.last.transactions_total).to be_zero
      end
    end
  end
end
