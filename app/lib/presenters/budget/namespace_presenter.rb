# frozen_string_literal: true

module Presenters
  module Budget
    class NamespacePresenter
      def categories
        ::Budget::Category.all.includes(:icon).map(&:as_presenter)
      end

      def category(id:)
        ::Budget::Category.find(id).as_presenter
      end

      def interval(month: Time.current.month, year: Time.current.year)
        ::Budget::Interval.for(month: month, year: year).as_presenter
      end

      def item(id:)
        ::Budget::Item
          .includes(events: :type)
          .includes(transaction_details: { entry: :account })
          .find(id)
          .as_presenter
      end
    end
  end
end
