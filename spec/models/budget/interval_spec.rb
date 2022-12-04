# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Interval, type: :model do
  it { is_expected.to have_many(:items) }

  describe 'month validations' do
    context 'when the month is nil' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: nil)

        expect(subject).to be_invalid
      end
    end

    context 'when the month is greater than 12' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: 13)

        expect(subject).to be_invalid
      end
    end

    context 'when the month is less than 1' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: 0)

        expect(subject).to be_invalid
      end
    end

    context 'when the month is 1-12' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: (1..12).to_a.sample)

        expect(subject).to be_valid
      end
    end
  end

  describe 'year validations' do
    context 'when the year is nil' do
      specify do
        subject = FactoryBot.build(:budget_interval, year: nil)

        expect(subject).to be_invalid
      end
    end

    context 'when the year is too early' do # 1990's gtfo
      specify do
        subject = FactoryBot.build(:budget_interval, year: 1999)

        expect(subject).to be_invalid
      end
    end

    context 'when the year is too late' do # if we live that long
      specify do
        subject = FactoryBot.build(:budget_interval, year: 2100)

        expect(subject).to be_invalid
      end
    end

    context 'when the year is valid' do
      specify do
        subject = FactoryBot.build(:budget_interval, year: (2000..2099).to_a.sample)

        expect(subject).to be_valid
      end
    end
  end

  # describe '.for' do
  # end

  describe '#first_date' do
    context 'when the first day lands normally' do # (2/28/19 is a Thursday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 3, year: 2019)
        expect(subject.first_date).to eq Date.new(2019, 3, 1)
      end
    end

    context 'when the first day lands on a Sunday' do # (8/1/21 is a Sunday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 8, year: 2021)
        expect(subject.first_date).to eq Date.new(2021, 7, 30)
      end
    end

    context 'when the first day lands on a Saturday' do # (5/1/21 is a Saturday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 5, year: 2021)
        expect(subject.first_date).to eq Date.new(2021, 4, 30)
      end
    end

    context 'when the first is New Year\'s Day' do # (1/1/24 is a Monday which is an edge case)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 1, year: 2024)
        expect(subject.first_date).to eq Date.new(2023, 12, 29)
      end
    end

    context 'when the first is a Monday and Labor Day' do # (9/1/25 is a Monday which is an edge case)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 9, year: 2025)
        expect(subject.first_date).to eq Date.new(2025, 8, 29)
      end
    end

    context 'when the Labor Day lands on a non-Monday' do # (9/1/22 is a Thursday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 9, year: 2022)
        expect(subject.first_date).to eq Date.new(2022, 9, 1)
      end
    end
  end

  describe '#last_date' do
    context 'when the last day lands normally' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: 2, year: 2019)
        expect(subject.last_date).to eq Date.new(2019, 2, 28)
      end
    end

    context 'when the first day of the next month lands on a Sunday' do # (8/1/21 is a Sunday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 7, year: 2021)
        expect(subject.last_date).to eq Date.new(2021, 7, 29)
      end
    end

    context 'when the first day of the next month lands on a Saturday' do # (5/1/21 is a Saturday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 4, year: 2021)
        expect(subject.last_date).to eq Date.new(2021, 4, 29)
      end
    end

    context 'when the first of the next month is New Year\'s Day' do # (1/1/24 is a Monday)
      specify do
        subject = FactoryBot.build(:budget_interval, month: 12, year: 2023)
        expect(subject.last_date).to eq Date.new(2023, 12, 28)
      end
    end
  end
end
