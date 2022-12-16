# frozen_string_literal: true

module Presenters
  module Budget
    class NamespacePresenter
      def initialize(user_id)
        @user_id = user_id
      end

      def categories(include_archived: false)
        categories_scope = user_category_scope.includes(:icon).includes(maturity_intervals: [:interval])
        categories_scope = user_category_scope.active unless include_archived

        categories_scope.map(&:as_presenter)
      end

      def category(slug:)
        user_category_scope.find_by!(slug: slug).as_presenter
      end

      def icons
        Icon.all
      end

      def interval(month: Time.current.month, year: Time.current.year)
        ::Budget::Interval.for(month: month, year: year, user_id: user_id).as_presenter
      end

      def item(key:)
        ::Budget::Item
          .joins(:category)
          .merge(user_category_scope)
          .includes(events: :type)
          .includes(transaction_details: { entry: :account })
          .for(key)
          .as_presenter
      end

      private

      attr_reader :user_id

      def user_category_scope
        ::Budget::Category.where(user_id: user_id)
      end
    end
  end
end
