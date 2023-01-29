# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Events::CreateItemForm do
  describe 'event type validation' do
    let(:user) { FactoryBot.create(:user) }
    let(:user_group) { user.user_group }

    context 'when a valid event' do
      it 'is a valid form object' do
        event_type = Budget::EventTypes::CREATE_EVENTS.sample
        form = new_object(user, event_type: event_type)
        expect(form).to be_valid
      end
    end

    context 'when an invalid event' do
      it 'is an invalid form object' do
        event_type = 'nonsense_event'
        form = new_object(user, event_type: event_type)
        expect(form).not_to be_valid
      end

      it 'has a meaningful error' do
        event_type = 'nonsense_event'
        form = new_object(user, event_type: event_type)
        form.valid?
        expect(form.errors['event_type'])
          .to include 'is not included in the list'
      end
    end
  end

  describe 'amount validation' do
    let(:user) { FactoryBot.create(:user) }

    context 'when a integer' do
      it 'is a valid form object' do
        form = new_object(user, amount: 0)
        expect(form).to be_valid
      end
    end

    context 'when a float' do
      it 'is an invalid form object' do
        form = new_object(user, amount: 0.4)
        expect(form).not_to be_valid
      end

      it 'has a meaningful error message' do
        form = new_object(user, amount: 0.4)
        form.valid?
        expect(form.errors['amount']).to include 'must be an integer'
      end
    end
  end

  describe '#save' do
    let(:user) { FactoryBot.create(:user) }

    context 'when the happy path' do
      it 'returns true' do
        form = new_object(user)
        expect(form.save).to be true
      end

      context 'when the interval does not exist' do
        it 'creates an interval if needed' do
          form = new_object(user, month: 1, year: 2017)
          expect { form.save }
            .to change { Budget::Interval.count }
            .by(+1)
        end
      end

      context 'when the interval does exist' do
        it 'does not create an interval - not needed' do
          interval = FactoryBot.create(:budget_interval)
          form = new_object(interval.user, month: interval.month, year: interval.year)
          expect { form.save }.not_to(change { Budget::Interval.count })
        end
      end

      it 'creates an event' do
        form = new_object(user, event_type: described_class::ITEM_CREATE)
        expect { form.save }
          .to change(Budget::ItemEvent.create_events, :count)
          .by(+1)
      end

      it 'creates an item' do
        form = new_object(user)
        expect { form.save }
          .to change(Budget::Item, :count)
          .by(+1)
      end

      context 'when the event type is specified as setup item create' do
        it 'creates an event' do
          form = new_object(user, event_type: described_class::SETUP_ITEM_CREATE)
          expect { form.save }
            .to change { Budget::ItemEvent.setup_item_create.count }
            .by(+1)
        end
      end

      context 'when the event type is specified as pre setup item create' do
        it 'creates an event' do
          budget_interval(traits: [])
          form = new_object(user, event_type: described_class::ITEM_CREATE)
          expect { form.save }
            .to change { Budget::ItemEvent.pre_setup_item_create.count }
            .by(+1)
        end
      end
    end

    context 'when budget category lookup returns nothing' do
      it 'returns false' do
        form = new_object(user, budget_category_id: nil)
        expect(form.save).to be false
      end

      it 'includes a meaningful error message' do
        form = new_object(user, budget_category_id: nil)
        form.valid?
        expect(form.errors['category']).to include 'can\'t be blank'
      end
    end

    context 'when creating an invalid weekly item' do
      let(:category) { budget_category(:expense, :weekly) }

      it 'returns false' do
        item = FactoryBot.create(:budget_item, category: category)
        interval = item.interval
        form = new_object(
          interval.user,
          amount: -22_50,
          budget_category_id: category.id,
          month: interval.month,
          year: interval.year
        )

        expect(form.save).to be false
      end

      it 'contains an error message' do
        item = FactoryBot.create(:budget_item, category: category)
        interval = item.interval
        form = new_object(
          interval.user,
          amount: -22_50,
          budget_category_id: category.id,
          month: interval.month,
          year: interval.year
        )
        form.save
        expect(form.errors['budget_category_id']).to include 'has already been taken'
      end
    end

    context 'when creating an invalid revenue item' do
      it 'returns false' do
        category = budget_category(:revenue)
        form = new_object(user, amount: -22_50, budget_category_id: category.id)
        expect(form.save).to be false
      end

      it 'contains an error message' do
        category = budget_category(:revenue)
        form = new_object(user, amount: -22_50, budget_category_id: category.id)
        form.valid?
        expect(form.errors['amount']).to include 'revenue items must be greater than or equal to $0.00'
      end
    end

    context 'when creating an invalid expense item' do
      it 'returns false' do
        category = budget_category(:expense)
        form = new_object(user, amount: 22_50, budget_category_id: category.id)
        expect(form.save).to be false
      end

      it 'contains an error message' do
        category = budget_category(:expense)
        form = new_object(user, amount: 22_50, budget_category_id: category.id)
        form.valid?
        expect(form.errors['amount']).to include 'expense items must be less than or equal to $0.00'
      end
    end

    context 'when errors on the interval' do
      it 'returns false' do
        form = new_object(user, month: 0)
        expect(form.save).to be false
      end

      it 'does not create an interval object' do
        form = new_object(user, month: 0)
        expect { form.save }.not_to(change { Budget::Interval.count })
      end

      it 'has a meaningful error message' do
        form = new_object(user, month: 0)
        form.save
        expect(form.errors['month']).to include 'is not included in the list'
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

  def today
    @today ||= Time.current
  end

  def new_params(user)
    {
      amount: amount,
      budget_category_slug: budget_category(user_group: user.user_group).slug,
      event_type: Budget::EventTypes::CREATE_EVENTS.sample,
      month: budget_interval.month,
      year: budget_interval.year,
      budget_item_key: SecureRandom.hex(6),
    }
  end

  def new_object(user, **overrides)
    described_class.new(user, new_params(user).merge(overrides))
  end

  def budget_category(*traits, **overrides)
    FactoryBot.create(:category, *traits, **overrides)
  end

  def budget_interval(**params)
    @budget_interval ||= begin
      month = params.fetch(:month) { rand(1..12) }
      year = params.fetch(:year) { rand(2019..2025) }
      traits = params.fetch(:traits, [:set_up])
      FactoryBot.create(:budget_interval, *traits, month: month, year: year)
    end
  end

  def amount
    r = rand(100_00)
    budget_category.expense? ? (r * -1) : r
  end
end
