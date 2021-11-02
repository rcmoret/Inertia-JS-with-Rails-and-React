# frozen_string_literal: true

module Budget
  module Events
    class FormBase
      class << self
        def applies?(event_type)
          applicable_event_types.include?(event_type)
        end

        protected

        def applicable_event_types
          raise NotImplementedError
        end
      end

      def initialize(*); end
    end
  end
end
