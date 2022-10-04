# frozen_string_literal: true

FactoryBot.define do
  factory :account do
    association :user
    sequence(:name) { |n| "#{n.ordinalize} City Bank" }
    sequence(:slug) { |n| "slug-#{n.ordinalize}" }
    sequence :priority

    factory :savings_account do
      non_cash_flow
    end

    trait :non_cash_flow do
      cash_flow { false }
    end

    trait :archived do
      archived_at { 1.year.ago }
    end
  end
end
