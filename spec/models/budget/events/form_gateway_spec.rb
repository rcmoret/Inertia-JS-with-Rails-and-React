# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Events::FormGateway do
  describe '.handler_registered?' do
    context 'when providing one that is registered' do
      it 'returns true' do
        event_type = Budget::EventTypes::CREATE_EVENTS.sample
        expect(described_class.handler_registered?(event_type)).to be true
      end
    end

    context 'when providing one that is not registered' do
      it 'returns false' do
        event_type = 'unregistered_event'
        expect(described_class.handler_registered?(event_type)).to be false
      end
    end
  end

  describe '.form_for' do
    let(:user) { FactoryBot.create(:user) }

    context 'when a create event' do
      it 'returns the create event form object initialized with event data' do
        event = {
          event_type: Budget::EventTypes::CREATE_EVENTS.sample,
          budget_item_id: rand(100),
          amount: rand(1000),
        }
        expect(Budget::Events::CreateItemForm).to receive(:new).with(user, event)

        described_class.form_for(user, event)
      end
    end

    context 'when an unregistered event' do
      it 'raises an error' do
        event = {
          event_type: 'unregistered_event',
          budget_item_id: rand(100),
          amount: rand(1000),
        }
        expect { described_class.form_for(user, event) }
          .to raise_error(described_class::MissingFormClassError)
      end
    end
  end
end
