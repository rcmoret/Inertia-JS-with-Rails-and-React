# frozen_string_literal: true

module Budget
  module Events
    class FormBase
      include ActiveModel::Model
      include EventTypes

      def initialize(current_user, params)
        @current_user = current_user
        @event_type = params[:event_type]
        @budget_item_key = params[:budget_item_key]
        @data = params[:data]
      end

      private

      def event
        @event ||= Budget::ItemEvent.new(item: budget_item,
                                         type: budget_item_event_type,
                                         data: data,
                                         key: SecureRandom.hex(6),
                                         amount: event_amount)
      end

      def budget_item
        raise NotImplementedError
      end

      def budget_item_event_type
        raise NotImplementedError
      end

      def event_amount
        raise NotImplementedError
      end

      attr_reader :current_user, :event_type, :budget_item_key, :data

      class << self
        def applies?(event_type)
          applicable_event_types.include?(event_type)
        end

        protected

        def applicable_event_types
          raise NotImplementedError
        end
      end
    end
  end
end
