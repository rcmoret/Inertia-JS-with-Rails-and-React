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
        ::Budget::Category.belonging_to(user).find_by!(slug: slug).as_presenter
      end

      def icons
        Icon.all
      end

      def interval(month: Time.current.month, year: Time.current.year)
        ::Budget::Interval.belonging_to(user).for(month: month, year: year).as_presenter
      end

      def item(key:)
        ::Budget::Item
          .belonging_to(user)
          .includes(events: :type, transaction_details: { entry: :account })
          .for(key)
          .as_presenter
      end

      private

      attr_reader :user
    end
  end
end
