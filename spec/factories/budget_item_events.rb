# frozen_string_literal: true

FactoryBot.define do
  factory :budget_item_event, class: 'Budget::ItemEvent' do
    association :type, factory: :budget_item_event_type
    association :item, factory: :budget_item
    amount { (-1000..1000).to_a.sample }

    trait :create_event do
      type do
        Budget::EventTypes::CREATE_EVENTS.sample.to_sym.then do |event_type|
          Budget::ItemEventType.find_by(name: event_type) || create(:budget_item_event_type, event_type)
        end
      end
    end

    trait :adjust_event do
      type do
        Budget::EventTypes::ADJUST_EVENTS.sample.to_sym.then do |event_type|
          Budget::ItemEventType.find_by(name: event_type) || create(:budget_item_event_type, event_type)
        end
      end
    end

    Budget::EventTypes::VALID_ITEM_TYPES.map(&:to_sym).each do |event_type|
      trait event_type do
        type do
          Budget::ItemEventType.find_by(name: event_type) || create(:budget_item_event_type, event_type)
        end
      end
    end
  end
end
