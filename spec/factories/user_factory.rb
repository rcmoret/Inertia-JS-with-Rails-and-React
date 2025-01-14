# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user-#{n}@example.com" }
    password { 'try-h@cK-th!$' }
    key { SecureRandom.hex(6) }
    association :user_group
  end
end
