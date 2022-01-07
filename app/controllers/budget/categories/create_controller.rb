# frozen_string_literal: true

module Budget
  module Categories
    class CreateController < ApplicationController
      def call
        if category.save
          redirect_to budget_categories_path
        else
          render inertia: 'BudgetCategoryIndexApp', props: category.errors
        end
      end

      private

      def redirect_url
        if include_archived?
          budget_categories_path(include_archived: true)
        else
          budget_categories_path
        end
      end

      def create_params
        params.require(:category).permit(
          :archived_at,
          :default_amount,
          :accrual,
          :expense,
          :icon_id,
          :monthly,
          :name,
          :slug
        )
      end

      def category
        @category ||= ::Budget::Category.new(create_params)
      end

      def include_archived?
        params.fetch(:include_archived, false) == 'true'
      end
    end
  end
end
