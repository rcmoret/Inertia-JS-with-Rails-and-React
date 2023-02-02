# frozen_string_literal: true

module Presenters
  module Budget
    class NamespacePresenter
      def initialize(user_id)
        @user = User.find(user_id)
      end

      def categories(include_archived: false)
        categories_scope = ::Budget::Category.belonging_to(user).includes(:icon, maturity_intervals: :interval)
        categories_scope = categories_scope.active unless include_archived

        categories_scope.map(&:as_presenter)
      end

      def category(slug:)
        ::Budget::Category.fetch(user: user, identifier: slug).as_presenter
      end

      def icons
        Icon.all
      end

      def interval(month: Time.current.month, year: Time.current.year)
        ::Budget::Interval.fetch(user: user, identifier: { month: month, year: year }).as_presenter
      end

      def item(key:)
        ::Budget::Item
          .includes(events: :type, transaction_details: { entry: :account })
          .fetch(user: user, identifier: key)
          .as_presenter
      end

      private

      attr_reader :user
    end
  end
end
