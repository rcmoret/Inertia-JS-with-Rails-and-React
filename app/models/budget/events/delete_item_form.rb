# frozen_string_literal: true

module Budget
  module Events
    class DeleteItemForm < FormBase
      def self.applicable_event_types
        DELETE_EVENTS
      end

      validates :budget_item, presence: true
      validates :event_type, inclusion: { in: DELETE_EVENTS }
      validate :no_transaction_details_present!
      validate :no_delete_events_present!

      def save
        return false unless valid?

        ItemEvent.transaction do
          update_item!
          save_event!
        end

        errors.none?
      end

      def attributes
        { event: event.attributes }
      end

      def to_s
        'delete_item_form'
      end

      private

      def budget_item
        @budget_item ||= Budget::Item.fetch(user: current_user, identifier: budget_item_key)
      end

      def event_amount
        budget_item.amount * -1
      end

      def update_item!
        return if budget_item.update(deleted_at: Time.current)

        promote_errors(budget_item.errors)
        raise ActiveRecord::Rollback
      end

      def save_event!
        return if event.save

        promote_errors(event.errors)
        raise ActiveRecord::Rollback
      end

      def budget_item_event_type
        Budget::ItemEventType.for(event_type)
      end

      def transaction_details
        return [] if budget_item.nil?

        budget_item.transaction_details
      end

      def no_transaction_details_present!
        return if transaction_details.size.zero?

        errors.add(:budget_item, 'cannot delete an item with transaction details')
      end

      def no_delete_events_present!
        return if budget_item.nil?
        return unless Budget::ItemEvent.item_delete.exists?(item_id: budget_item.id)

        errors.add(:budget_item, 'cannot record a subsequent delete event')
      end

      def promote_errors(model_errors)
        model_errors.each do |error|
          errors.add(error.attribute, error.message)
        end
      end
    end
  end
end
