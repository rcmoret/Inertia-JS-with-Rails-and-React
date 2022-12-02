# frozen_string_literal: true

module Budget
  module Categories
    class IndexController < ApplicationController
      include AccountsHelper
      include GraphQuery

      def call
        render inertia: 'BudgetCategoryIndexApp', props: props
      end

      private

      def query
        GraphQueries::BudgetCategories.index_query(current_user.id, include_archived: include_archived?)
      end

      def include_archived?
        params.fetch(:include_archived, false) == 'true'
      end

      def additional_props
        { includesArchived: include_archived?, selectedAccountPath: selected_account_path }
      end

      def namespace
        'budget'
      end
    end
  end
end
