# frozen_string_literal: true

FactoryBot.define do
  factory :budget_interval, class: 'Budget::Interval' do
    month { (1..12).to_a.sample }
    year { (2018..2030).to_a.sample }

    trait :current do
      month { Date.today.month }
      year { Date.today.year }
    end

    trait :set_up do
      set_up_completed_at { 1.day.ago }
    end

    trait :closed_out do
      after(:create) do |interval, _evaluator|
        interval.update(close_out_completed_at: Date.new(interval.year, interval.month, -1))
        # close_out_completed_at { Date.new(month, year, -1) }
      end
    end
  end
end
