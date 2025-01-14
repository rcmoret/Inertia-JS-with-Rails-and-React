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
        params.require(:category).permit(Budget::Category::PERMITTED_PARAMS)
      end

      def category
        @category ||= Budget::Category.belonging_to(current_user).build(create_params)
      end

      def include_archived?
        params.fetch(:include_archived, false) == 'true'
      end
    end
  end
end
