# frozen_string_literal: true

module Presenters
  module Budget
    class ItemEventPresenter < SimpleDelegator
      def type_description
        type.name
      end

      def data
        super&.to_json
      end
    end
  end
end
