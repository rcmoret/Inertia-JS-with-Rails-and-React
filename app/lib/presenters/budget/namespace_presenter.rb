# frozen_string_literal: true

module Presenters
  module Budget
    class NamespacePresenter
      def initialize(user_id)
        @user_id = user_id
      end

      attr_reader :user_id

      def categories(include_archived: false)
        base_scope = include_archived ? ::Budget::Category.all : ::Budget::Category.active

        base_scope
          .includes(:icon)
          .includes(maturity_intervals: [:interval])
          .map(&:as_presenter)
      end

      def category(id:)
        ::Budget::Category.find(id).as_presenter
      end

      def icons
        Icon.all
      end

      def interval(month: Time.current.month, year: Time.current.year)
        ::Budget::Interval.for(month: month, year: year, user_id: user_id).as_presenter
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
