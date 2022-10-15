# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::Budget::MaturityIntervalsQuery do
  let(:current_month) { 10 }
  let(:current_year) { 2022 }
  let(:user) { FactoryBot.create(:user) }

  around do |ex|
    travel_to(Date.new(current_year, current_month, 15)) { ex.run }
  end

  context 'when there are no maturity intervals for any categories' do
    before { FactoryBot.create(:category, :accrual) }

    it 'returns an empty result set' do
      subject = described_class.new(month: current_month, year: current_year, user_id: user.id)

      expect(subject.call).to be_empty
    end
  end

  context 'when there are only past maturity intervals for a category' do
    let(:category) { FactoryBot.create(:category, :accrual) }
    let(:previous_interval) { FactoryBot.create(:budget_interval, month: (current_month - 1), year: current_year) }

    before { FactoryBot.create(:maturity_interval, category: category, interval: previous_interval) }

    it 'returns an empty result set' do
      subject = described_class.new(month: current_month, year: current_year, user_id: user.id)

      expect(subject.call).to be_empty
    end
  end

  context 'when there is a maturity interval for a category which is "current"' do
    let(:category) { FactoryBot.create(:category, :accrual) }
    let(:interval) do
      FactoryBot.create(:budget_interval, month: current_month, year: current_year)
    end

    before { FactoryBot.create(:maturity_interval, category: category, interval: interval) }

    it 'returns a date in the current month' do
      subject = described_class.new(month: current_month, year: current_year, user_id: user.id).call

      actual_result = subject.fetch(category.id)
      expect(actual_result.month).to be current_month
      expect(actual_result.year).to be current_year
    end
  end

  context 'when there is a maturity interval for a category which is in the future' do
    let(:category) { FactoryBot.create(:category, :accrual) }

    context 'when the next maturity interval is next year' do
      let(:interval) do
        FactoryBot.create(:budget_interval, month: 1, year: (current_year + 1))
      end

      before { FactoryBot.create(:maturity_interval, category: category, interval: interval) }

      it 'returns the upcoming date (in the next year)' do
        subject = described_class.new(month: current_month, year: current_year, user_id: user.id).call

        actual_date = subject.fetch(category.id)
        expect(actual_date.month).to be interval.month
        expect(actual_date.year).to be interval.year
      end
    end

    context 'when the next maturity interval is in the current year' do
      let(:next_year_interval) do
        FactoryBot.create(:budget_interval, month: 1, year: (current_year + 1))
      end
      let(:this_year_interval) do
        FactoryBot.create(:budget_interval, month: 12, year: current_year)
      end

      before do
        FactoryBot.create(:maturity_interval, category: category, interval: next_year_interval)
        FactoryBot.create(:maturity_interval, category: category, interval: this_year_interval)
      end

      it 'returns the upcoming date for later this year' do
        subject = described_class.new(month: current_month, year: current_year, user_id: user.id).call

        actual_date = subject.fetch(category.id)
        expect(actual_date.month).to be this_year_interval.month
        expect(actual_date.year).to be this_year_interval.year
      end
    end
  end
end
