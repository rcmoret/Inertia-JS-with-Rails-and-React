# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Events::AdjustItemForm do
  describe '.applies?' do
    context 'when an applicable event' do
      it 'returns true' do
        event_type = Budget::EventTypes::ADJUST_EVENTS.sample
        expect(described_class.applies?(event_type)).to be true
      end
    end

    context 'when a non-applicable event' do
      it 'returns false' do
        event_type = Budget::EventTypes::CREATE_EVENTS.sample
        expect(described_class.applies?(event_type)).to be false
      end
    end
  end

  describe 'validations' do
    let(:user) { FactoryBot.create(:user) }

    describe 'event type validation' do
      context 'when a valid event' do
        it 'is a valid form object' do
          event_type = Budget::EventTypes::ADJUST_EVENTS.sample
          form = build_form(user, event_type: event_type)
          expect(form).to be_valid
        end
      end

      context 'when an invalid event' do
        it 'is an invalid form object' do
          event_type = 'nonsense_event'
          form = build_form(user, event_type: event_type)
          expect(form).not_to be_valid
        end

        it 'has a meaningful error' do
          event_type = 'nonsense_event'
          form = build_form(user, event_type: event_type)
          form.valid?
          expect(form.errors['event_type'])
            .to include 'is not included in the list'
        end
      end
    end

    describe 'item validation' do
      context 'when a budget item exists' do
        it 'is a valid form object' do
          form = build_form(user)
          expect(form).to be_valid
        end
      end

      context 'when the budget item exists for the id passed' do
        it 'is an invalid form object' do
          form = build_form(user, budget_item_key: '0')
          expect(form).not_to be_valid
        end

        it 'returns a meaniful error message' do
          form = build_form(user, budget_item_key: '0')
          form.valid?
          expect(form.errors['budget_item']).to include 'can\'t be blank'
        end
      end
    end

    describe 'amount validation' do
      context 'when a float' do
        it 'is an invalid form object' do
          form = build_form(user, amount: 0.4)
          expect(form).not_to be_valid
        end

        it 'has a meaningful error message' do
          item = budget_item(:revenue, user_group: user.user_group)
          form = build_form(user, budget_item_key: item.key, amount: 0.4)
          form.valid?
          expect(form.errors['amount']).to include 'must be an integer'
        end
      end

      context 'when the item category is a revenue' do
        context 'when the amount is positive' do
          it 'is valid' do
            budget_item(:revenue, user_group: user.user_group)
            form = build_form(user, amount: 129_50)
            expect(form).to be_valid
          end
        end

        context 'when the amount is negative' do
          it 'is not valid' do
            budget_item(:revenue, user_group: user.user_group)
            form = build_form(user, amount: -129_50)
            expect(form).not_to be_valid
          end

          it 'provides an error message' do
            budget_item(:revenue, user_group: user.user_group)
            form = build_form(user, amount: -129_50)
            form.valid?
            expect(form.errors['amount'])
              .to include 'revenue items must be greater than or equal to 0'
          end
        end
      end

      context 'when the item category is an expense' do
        context 'when the amount is negative' do
          it 'is valid' do
            budget_item(:expense, user_group: user.user_group)
            form = build_form(user, amount: -32_09)
            expect(form).to be_valid
          end
        end

        context 'when the amount is positive' do
          it 'is not valid' do
            budget_item(:expense, user_group: user.user_group)
            form = build_form(user, amount: 32_09)
            expect(form).not_to be_valid
          end

          it 'provides an error message' do
            budget_item(:expense, user_group: user.user_group)
            form = build_form(user, amount: 32_09)
            form.valid?
            expect(form.errors['amount']).to include 'expense items must be less than or equal to 0'
          end
        end
      end
    end
  end

  describe '.save' do
    let(:user) { FactoryBot.create(:user) }

    describe 'creates an event' do
      it 'adds an adjustment event' do
        form = build_form(user, event_type: 'item_adjust')
        expect { form.save }.to(change { Budget::ItemEvent.item_adjust.count }.from(0).to(+1))
      end

      it 'returns true' do
        form = build_form(user, event_type: 'item_adjust')
        expect(form.save).to be true
      end
    end

    describe 'pre-save validations' do
      context 'when invalid' do
        it 'returns false' do
          form = build_form(user, amount: -9.33)
          expect(form.save).to be false
        end
      end
    end

    describe 'the new event' do
      context 'when it is a valid event' do
        before { stub_new_event! }

        context 'when increasing an expense' do
          it 'calls new with the correct args' do
            stub_budget_item(amount: -22_89, expense: true)
            form = build_form(user, amount: -32_89)
            expect(Budget::ItemEvent)
              .to receive(:new)
              .with(hash_including(amount: -10_00))
            form.save
          end
        end

        context 'when decreasing an expense' do
          it 'calls new with the correct args' do
            stub_budget_item(amount: -22_89, expense: true)
            form = build_form(user, amount: -15_89)
            expect(Budget::ItemEvent)
              .to receive(:new)
              .with(hash_including(amount: 7_00))
            form.save
          end
        end

        context 'when increasing a revenue' do
          it 'calls new with the correct args' do
            stub_budget_item(amount: 22_89, expense: false)
            form = build_form(user, amount: 32_89)
            expect(Budget::ItemEvent)
              .to receive(:new)
              .with(hash_including(amount: 10_00))
            form.save
          end
        end

        context 'when decreasing a revenue' do
          it 'calls new with the correct args' do
            stub_budget_item(amount: 22_89, expense: false)
            form = build_form(user, amount: 15_89)
            expect(Budget::ItemEvent)
              .to receive(:new)
              .with(hash_including(amount: -7_00))
            form.save
          end
        end

        context 'when providing json data' do
          it 'calls new and passes in the json' do
            stub_budget_item(amount: 22_89, expense: false)
            data = { 'info' => rand(100) }
            form = build_form(user, data: data)
            expect(Budget::ItemEvent)
              .to receive(:new)
              .with(hash_including(data: data))
            form.save
          end
        end

        it 'calls save on the new event object' do
          stub_budget_item(amount: 22_89, expense: false)
          form = build_form(user, amount: 15_89)
          expect(event_double).to receive(:save)
          form.save
        end
      end
    end

    context 'when the event fails to save' do
      before { stub_new_event_with_errors! }

      it 'returns false' do
        form = build_form(user)
        expect(form.save).to be false
      end

      it 'includes the event errors' do
        form = build_form(user)
        form.save
        expect(form.errors['count']).to include 'cannot be greater than 0'
      end
    end
  end

  def budget_item(*traits, **attributes)
    @budget_item ||= FactoryBot.create(:budget_item, *traits, **attributes)
  end

  def default_form_params(user)
    {
      budget_item_key: budget_item(user_group: user.user_group).key,
      event_type: Budget::EventTypes::ADJUST_EVENTS.sample,
      amount: 0,
      data: nil,
    }
  end

  def build_form(user, **options)
    described_class.new(user, default_form_params(user).merge(options))
  end

  def event_double(**options)
    @event_double ||= instance_double(Budget::ItemEvent, save: true, **options)
  end

  def stub_new_event!
    allow(Budget::ItemEvent)
      .to receive(:new)
      .and_return(event_double)
  end

  def stub_new_event_with_errors!
    allow(Budget::ItemEvent)
      .to receive(:new)
      .and_return(event_double(save: false, errors: event_errors))
  end

  def stub_budget_item(amount:, expense:)
    allow(Budget::Item)
      .to receive(:for)
      .and_return(item_double(amount, expense))
  end

  def item_double(amount, expense)
    instance_double(
      Budget::Item,
      amount: amount,
      expense?: expense,
      revenue?: !expense
    )
  end

  def event_errors
    event = instance_double(Budget::ItemEvent)
    @event_errors ||= ActiveModel::Errors.new(event).tap do |e|
      e.add(:count, 'cannot be greater than 0')
    end
  end
end
