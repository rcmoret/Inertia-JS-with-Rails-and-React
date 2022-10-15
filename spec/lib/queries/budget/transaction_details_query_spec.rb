# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Budget::TransactionDetailsQuery do
  describe '.call' do
    context 'when there are no transaction details' do
      let(:user) { FactoryBot.create(:user) }
      let(:interval) { FactoryBot.create(:budget_interval).tap { |i| i.user_id = user.id } }

      before { FactoryBot.create(:budget_item, budget_interval_id: interval.id) }

      it 'returns an empty result set' do
        subject = described_class.new(
          month: interval.month,
          year: interval.year,
          user_id: interval.user_id
        ).call

        expect(subject.fetch(1).collection).to be_empty
        expect(subject.fetch(1).transactions_count).to be_zero
        expect(subject.fetch(1).transactions_total).to be_zero
      end
    end

    context 'when there are transaction details' do
      let(:user) { FactoryBot.create(:user) }
      let(:interval) { FactoryBot.create(:budget_interval).tap { |i| i.user_id = user.id } }
      let(:budget_item) { FactoryBot.create(:weekly_item, budget_interval_id: interval.id) }

      let!(:transaction_details) do
        FactoryBot.create_list(:transaction_detail, 4, budget_item: budget_item)
      end

      it 'returns a result set including transactions count and total' do
        subject = described_class.new(
          month: interval.month,
          year: interval.year,
          user_id: interval.user_id
        ).call

        expect(subject.fetch(budget_item.id).transactions_total).to be transaction_details.sum(&:amount)
        expect(subject.fetch(budget_item.id).transactions_count).to be transaction_details.size
      end

      it 'returns a result set including an array of details' do
        subject = described_class.new(
          month: interval.month,
          year: interval.year,
          user_id: interval.user_id
        ).call

        expected_details = transaction_details.map do |detail|
          {
            id: detail.id,
            amount: detail.amount,
            updated_at: detail.updated_at.strftime('%FT%T.%6N').sub(/0+$/, ''),
            account_name: detail.entry.account.name,
            clearance_date: detail.entry.clearance_date.to_s,
            description: detail.entry.description,
          }
        end

        expect(subject.fetch(budget_item.id).collection.map(&:to_h)).to contain_exactly(*expected_details)
      end
    end
  end
end
