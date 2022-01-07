# frozen_string_literal: true

module Budget
  module Categories
    class IndexController < ApplicationController
      include GraphQuery

      def call
        render inertia: 'BudgetCategoryIndexApp', props: props
      end

      private

      def query
        <<~GQL
          {
            budget {
              categories(includeArchived: #{include_archived?}) {
                id
                archivedAt
                defaultAmount
                isAccrual
                isArchived
                isExpense
                isMonthly
                name
                slug
                icon { id className name }
                maturityIntervals { id month year }
              }
              icons { id className name }
            }
          }
        GQL
      end

      def include_archived?
        params.fetch(:include_archived, false) == 'true'
      end

      def additional_props
        { includesArchived: include_archived? }
      end

      def namespace
        'budget'
      end
    end
  end
end
