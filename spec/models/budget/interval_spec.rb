# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Interval, type: :model do
  it { should have_many(:items) }

  describe 'month validations' do
    context 'month is nil' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: nil)

        expect(subject).to be_invalid
      end
    end

    context 'month is greater than 12' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: 13)

        expect(subject).to be_invalid
      end
    end

    context 'month is less than 1' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: 0)

        expect(subject).to be_invalid
      end
    end

    context 'month is 1-12' do
      specify do
        subject = FactoryBot.build(:budget_interval, month: (1..12).to_a.sample)

        expect(subject).to be_valid
      end
    end
  end

  describe 'year validations' do
    context 'year is nil' do
      specify do
        subject = FactoryBot.build(:budget_interval, year: nil)

        expect(subject).to be_invalid
      end
    end

    context 'year is too early' do # 1990's gtfo
      specify do
        subject = FactoryBot.build(:budget_interval, year: 1999)

        expect(subject).to be_invalid
      end
    end

    context 'year is too late' do # if we live that long
      specify do
        subject = FactoryBot.build(:budget_interval, year: 2100)

        expect(subject).to be_invalid
      end
    end

    context 'year is valid' do
      specify do
        subject = FactoryBot.build(:budget_interval, year: (2000..2099).to_a.sample)

        expect(subject).to be_valid
      end
    end

    describe '.for' do
      let(:year) { (2000..2099).to_a.sample }
      let(:today) { Date.new(year, 3, 14) }
      let(:first_of_march) { Date.new(year, 3, 1) }
      let(:first_of_april) { Date.new(year, 4, 1) }

      before { Timecop.travel(today) }

      describe 'accepts a date object as a named parameter' do
        specify do
          subject = described_class.for(date: first_of_march)
          expect(subject.month).to be 3
          expect(subject.year).to be year
        end
      end

      describe 'accpets a date string as a named parameter' do
        specify do
          subject = described_class.for(date: first_of_march.to_s)
          expect(subject.month).to be 3
          expect(subject.year).to be year
        end
      end

      describe 'raising an error if invalid date' do
        specify do
          expect { described_class.for(date: 'foo bar') }.to raise_error ArgumentError
        end
      end

      describe 'passing a month as a named parameter' do
        specify do
          subject = described_class.for(month: 3)
          expect(subject.month).to be 3
          expect(subject.year).to be year
        end
      end
    end

    describe '#first_date' do
      context 'when the first day lands normally' do # (2/28/19 is a Thursday)
        specify do
          subject = FactoryBot.build(:budget_interval, month: 3, year: 2019)
          expect(subject.first_date).to eq Date.new(2019, 2, 28)
        end
      end

      context 'when the first day lands on a Fri but would be on the weekend' do # (1/31/21 is a Sunday)
        specify do
          subject = FactoryBot.build(:budget_interval, month: 2, year: 2021)
          expect(subject.first_date).to eq Date.new(2021, 1, 29)
        end
      end
    end

    describe '#last_date' do
      context 'when the last day lands normally' do
        specify do
          subject = FactoryBot.build(:budget_interval, month: 2, year: 2019)
          expect(subject.last_date).to eq Date.new(2019, 2, 27)
        end
      end

      context 'when the last day lands on the weekend' do
        specify do
          subject = FactoryBot.build(:budget_interval, month: 2, year: 2021)
          expect(subject.first_date).to eq Date.new(2021, 1, 29)
        end
      end
    end
  end
end
