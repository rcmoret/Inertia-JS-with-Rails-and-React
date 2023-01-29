# frozen_string_literal: true

FactoryBot.define do
  factory :user_group do
    sequence(:name) { |n| "user_group_#{n}" }
    sequence(:primary_email) { |n| "user_group_#{n}@example.com" }
  end
end
