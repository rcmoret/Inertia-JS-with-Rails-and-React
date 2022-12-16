# frozen_string_literal: true

module Budget
  module Categories
    class UpdateController < ApplicationController
      def call
        if category.update(update_params)
          redirect_to redirect_url
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

      def update_params
        params.require(:category).permit(*BudgetCategories::PERMITTED_PARAMS)
      end

      def category
        @category ||= current_user.budget_categories.find(params.fetch(:id))
      end

      def include_archived?
        params.fetch(:include_archived, false) == 'true'
      end
    end
  end
end
