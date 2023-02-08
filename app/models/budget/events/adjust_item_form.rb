# frozen_string_literal: true

module Budget
  module Events
    class AdjustItemForm < FormBase
      include Messages

      def self.applicable_event_types
        ADJUST_EVENTS
      end

      validates :event_type, inclusion: { in: ADJUST_EVENTS }
      validates :amount, numericality: { only_integer: true }
      validates :budget_item, presence: true
      validates :amount,
                numericality: {
                  less_than_or_equal_to: 0,
                  message: EXPENSE_AMOUNT_VALIDATION_MESSAGE,
                },
                if: :expense?
      validates :amount,
                numericality: {
                  greater_than_or_equal_to: 0,
                  message: REVENUE_AMOUNT_VALIDATION_MESSAGE,
                },
                if: :revenue?

      def initialize(current_user, params)
        super(current_user, params)
        @amount = params[:amount]
      end

      delegate :expense?, :revenue?, to: :budget_item, allow_nil: true

      def save
        return false unless valid?
        return true if event.save

        promote_errors(event.errors)
        false
      end

      def to_s
        'adjust_item_form'
      end

      private

      def budget_item
        @budget_item ||= Budget::Item.fetch(user: current_user, identifier: budget_item_key)
      end

      def event_amount
        @event_amount ||= amount.to_i - budget_item.amount
      end

      def budget_item_event_type
        ItemEventType.send(event_type)
      end

      def promote_errors(model_errors)
        model_errors.each do |error|
          errors.add(error.attribute, error.message)
        end
      end

      attr_reader :amount
    end
  end
end
