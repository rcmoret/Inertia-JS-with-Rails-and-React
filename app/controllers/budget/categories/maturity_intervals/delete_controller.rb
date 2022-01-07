# frozen_string_literal: true

module Budget
  module Categories
    module MaturityIntervals
      class DeleteController < ApplicationController
        def call
          if maturity_interval.destroy
            redirect_to redirect_url
          else
            render inertia: 'BudgetCategoryIndexApp', props: maturity_interval.errors
          end
        end

        private

        def maturity_interval
          Budget::CategoryMaturityInterval.find(params.fetch(:id))
        end

        def redirect_url
          params.fetch(:redirect_to)
        end
      end
    end
  end
end
