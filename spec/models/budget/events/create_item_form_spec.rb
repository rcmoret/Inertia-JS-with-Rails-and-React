# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Events::CreateItemForm do
  describe 'event type validation' do
    let(:user) { FactoryBot.create(:user) }
    let(:category) { FactoryBot.create(:category, :expense, user_group: user.user_group) }
    let(:interval) { FactoryBot.create(:budget_interval, user_group: user.user_group) }

    context 'when a valid event' do
      it 'is a valid form object' do
        params = params_for(category: category, interval: interval)
        form = described_class.new(user, params)
        expect(form).to be_valid
      end
    end

    context 'when an invalid event' do
      it 'is an invalid form object' do
        params = params_for(category: category, interval: interval, event_type: 'nonsense_event')
        form = described_class.new(user, params)
        expect(form).not_to be_valid
        expect(form.errors[:event_type]).to include 'is not included in the list'
      end
    end
  end

  describe 'amount validation' do
    let(:user) { FactoryBot.create(:user) }
    let(:category) { FactoryBot.create(:category, :expense, user_group: user.user_group) }
    let(:interval) { FactoryBot.create(:budget_interval, user_group: user.user_group) }

    context 'when a integer' do
      it 'is a valid form object' do
        params = params_for(category: category, interval: interval, amount: 0)
        form = described_class.new(user, params)
        expect(form).to be_valid
      end
    end

    context 'when a float' do
      it 'is an invalid form object' do
        params = params_for(category: category, interval: interval, amount: -0.4)
        form = described_class.new(user, params)
        expect(form).not_to be_valid
        expect(form.errors['amount']).to include 'must be an integer'
      end
    end

    context 'when passing a postive amount for an expense' do
      it 'is an invalid for object' do
        params = params_for(category: category, interval: interval, amount: 40)
        form = described_class.new(user, params)
        expect(form).not_to be_valid
        expect(form.errors['amount']).to include 'expense items must be less than or equal to 0'
      end
    end

    context 'when passing a negative amount for a revenue item' do
      let(:category) { FactoryBot.create(:category, :revenue, user_group: user.user_group) }

      it 'returns false' do
        params = params_for(amount: -22_50, category: category, interval: interval)
        form = described_class.new(user, params)
        expect(form.save).to be false
        expect(form.errors['amount']).to include 'revenue items must be greater than or equal to 0'
      end
    end
  end

  describe '#save' do
    let(:user) { FactoryBot.create(:user) }
    let(:category) { FactoryBot.create(:category, :expense, user_group: user.user_group) }
    let(:interval) { FactoryBot.create(:budget_interval, month: 2, year: 2023, user_group: user.user_group) }

    context 'when the happy path' do
      it 'returns true' do
        params = params_for(interval: interval, category: category)
        expect(described_class.new(user, params).save).to be true
      end

      it 'creates an interval if needed' do
        params = params_for(interval: interval, category: category, month: 1, year: 2019)
        expect { described_class.new(user, params).save }
          .to change { Budget::Interval.count }
          .by(+1)
      end

      it 'does not create an interval - not needed' do
        params = params_for(interval: interval, category: category)
        expect { described_class.new(user, params).save }.not_to(change { Budget::Interval.count })
      end

      it 'creates an event' do
        params = params_for(category: category, interval: interval)
        expect { described_class.new(user, params).save }
          .to change { Budget::ItemEvent.create_events.count }
          .by(+1)
      end

      it 'creates an item' do
        params = params_for(category: category, interval: interval)
        expect { described_class.new(user, params).save }
          .to change { Budget::Item.count }
          .by(+1)
      end

      context 'when the event type is specified as setup item create' do
        it 'creates an event' do
          params = params_for(category: category, interval: interval, event_type: described_class::SETUP_ITEM_CREATE)
          expect { described_class.new(user, params).save }
            .to change { Budget::ItemEvent.setup_item_create.count }
            .by(+1)
        end
      end

      context 'when the event is created before the interval is set up' do
        it 'creates a pre-set-up item create event' do
          params = params_for(interval: interval, category: category, event_type: described_class::ITEM_CREATE)
          expect { described_class.new(user, params).save }
            .to change { Budget::ItemEvent.pre_setup_item_create.count }
            .by(+1)
        end
      end

      context 'when the event is created after the interval is set up' do
        let(:interval) { FactoryBot.create(:budget_interval, :set_up, user_group: user.user_group) }

        it 'creates a regular item create event' do
          params = params_for(interval: interval, category: category, event_type: described_class::ITEM_CREATE)
          expect { described_class.new(user, params).save }
            .to change { Budget::ItemEvent.item_create.count }
            .by(+1)
        end
      end
    end

    context 'when budget category lookup returns nothing' do
      it 'returns false' do
        params = params_for(category: category, interval: interval, budget_category_slug: 'nil')
        form = described_class.new(user, params)
        expect(form.save).to be false
        expect(form.errors['category']).to include 'can\'t be blank'
      end
    end

    context 'when creating an invalid weekly item' do
      let(:category) { FactoryBot.create(:category, :expense, :weekly, user_group: user.user_group) }
      let(:interval) { FactoryBot.create(:budget_interval, user_group: user.user_group) }

      it 'returns false' do
        FactoryBot.create(:budget_item, category: category, interval: interval, user_group: user.user_group)
        params = params_for(category: category, interval: interval)
        form = described_class.new(user, params)
        expect(form.save).to be false
        expect(form.errors['budget_category_id']).to include 'has already been taken'
      end
    end

    context 'when errors on the interval' do
      it 'returns false' do
        params = params_for(interval: interval, category: category, month: 0)
        form = described_class.new(user, params)
        expect(form.save).to be false
        expect(form.errors['month']).to include 'is not included in the list'
      end

      it 'does not create an interval object' do
        params = params_for(interval: interval, category: category, month: 0)
        expect { described_class.new(user, params).save }.not_to(change { Budget::Interval.count })
      end
    end
  end

  describe '.applies?' do
    context 'when applicable' do
      specify do
        event_type = Budget::EventTypes::CREATE_EVENTS.sample
        expect(described_class.applies?(event_type)).to be true
      end
    end

    context 'when not applicable' do
      specify do
        event_type = 'foo_bar_biz'
        expect(described_class.applies?(event_type)).to be false
      end
    end
  end

  def params_for(category:, interval:, **overrides)
    amount = category.expense? ? -100_00 : 100_00
    {
      event_type: Budget::EventTypes::CREATE_EVENTS.sample,
      amount: amount,
      month: interval.month,
      year: interval.year,
      budget_category_slug: category.slug,
      budget_item_key: SecureRandom.hex(6),
      data: {},
    }.merge(overrides)
  end
end
