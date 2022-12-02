# frozen_string_literal: true

module Budget
  module Events
    class FormGateway
      REGISTERED_CLASSES = [
        AdjustItemForm,
        CreateItemForm,
        DeleteItemForm,
      ].freeze

      REGISTERED_EVENT_TYPES = REGISTERED_CLASSES.reduce([]) do |list, klass|
        raise DuplicateEventTypeRegistrationError if (list & klass.applicable_event_types).any?

        [*list, *klass.applicable_event_types.dup]
      end.freeze

      class << self
        def handler_registered?(event_type)
          REGISTERED_EVENT_TYPES.include?(event_type)
        end

        def form_for(current_user, event)
          event_type = event.fetch(:event_type)
          form_class = REGISTERED_CLASSES.find { |potential_hanlder| potential_hanlder.applies?(event_type) }
          return form_class.new(current_user, event) unless form_class.nil?

          raise MissingFormClassError, "no form_class register for #{event_type}"
        end
      end

      MissingFormClassError = Class.new(StandardError)
      DuplicateEventTypeRegistrationError = Class.new(StandardError)
    end
  end
end
