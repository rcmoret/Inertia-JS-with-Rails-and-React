# frozen_string_literal: true

FactoryBot.define do
  factory :budget_item, class: 'Budget::Item' do
    association :category
    association :interval, factory: :budget_interval

    key { SecureRandom.hex(6) }

    trait :expense do
      association :category, factory: %i[category expense]
    end

    trait :revenue do
      association :category, factory: %i[category revenue]
    end

    factory :monthly_item do
      revenue
      association :category, factory: %i[category monthly revenue]
    end

    factory :monthly_expense do
      expense
      association :category, factory: %i[category monthly expense]
    end

    factory :monthly_revenue do
      revenue
      association :category, factory: %i[category monthly revenue]
    end

    factory :weekly_item do
      expense
      association :category, factory: %i[category weekly]
    end

    factory :weekly_expense do
      expense
      association :category, factory: %i[category weekly expense]
    end

    factory :weekly_revenue do
      revenue
      association :category, factory: %i[category weekly revenue]
    end

    transient do
      user { create(:user) }
    end

    after(:create) do |budget_item, evaluator|
      budget_item.category.update(user: evaluator.user) if evaluator.user
    end
  end
end
