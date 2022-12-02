# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Presenters::Budget::IntervalPresenter do
  describe '#current?' do
    context 'in the past' do
      specify do
        interval = FactoryBot.build(:budget_interval, year: (Time.zone.today.year + 1))

        subject = described_class.new(interval)

        expect(subject.current?).to be false
      end
    end

    context 'in the future' do
      specify do
        interval = FactoryBot.build(:budget_interval, year: (Time.zone.today.year - 1))

        subject = described_class.new(interval)

        expect(subject.current?).to be false
      end
    end

    context 'in current month' do
      specify do
        today = Time.zone.today
        interval = FactoryBot.create(:budget_interval, year: today.year, month: today.month)

        subject = described_class.new(interval)

        subject.prev.tap { |m| m.update(close_out_completed_at: 1.second.ago) }

        expect(subject.current?).to be true
      end
    end
  end

  describe '#set_up?' do
    context 'when set up completed at is populated' do
      specify do
        subject = FactoryBot.build(:budget_interval, set_up_completed_at: 1.day.ago).then do |interval|
          described_class.new(interval)
        end

        expect(subject.set_up?).to be true
      end
    end

    context 'when set up completed at is nil' do
      specify do
        subject = FactoryBot.build(:budget_interval, set_up_completed_at: nil).then do |interval|
          described_class.new(interval)
        end

        expect(subject.set_up?).to be false
      end
    end
  end

  describe '#closed_out?' do
    context 'when close out completed at is populated' do
      specify do
        interval = FactoryBot.build(:budget_interval, close_out_completed_at: 1.day.ago)

        subject = described_class.new(interval)

        expect(subject.closed_out?).to be true
      end

      context 'when close out completed at is nil' do
        specify do
          interval = FactoryBot.build(:budget_interval, close_out_completed_at: nil)

          subject = described_class.new(interval)

          expect(subject.closed_out?).to be false
        end
      end
    end
  end

  describe '#days_remaining' do
    let(:year) { 2021 }
    let(:month) { 3 }
    let(:interval) { FactoryBot.create(:budget_interval, year: year, month: month) }

    context 'in current month' do
      around do
        Timecop.travel(Date.new(year, month, 15))
        interval.prev.update(close_out_completed_at: 1.second.ago)
      end

      # context 'when using the last biz day of the month'
      specify do
        subject = described_class.new(interval)

        expect(subject.days_remaining).to be 17
      end

      # context 'when using a calendar month month'
      xspecify do
        subject = described_class.new(interval)

        expect(subject.days_remaining).to be 17
      end
    end

    context 'in a past month' do
      before { Timecop.travel(future_month) }

      let(:future_month) { Date.new(year + 1, month, 10) }

      # context 'when using the last biz day of the month'
      specify do
        subject = described_class.new(interval)

        expect(subject.days_remaining).to be 31
      end

      # context 'when using a calendar month month'
      xspecify do
        subject = described_class.new(interval)

        expect(subject.days_remaining).to be 32
      end
    end
  end
end
