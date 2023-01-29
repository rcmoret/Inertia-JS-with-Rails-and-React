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
          @maturity_interval ||= Budget::CategoryMaturityInterval.find_by(interval: interval, category: category)
        end

        def category
          @category ||= BudgetCategory.belonging_to(current_user).find_by!(slug: params.fetch(:slug))
        end

        def interval
          @interval ||= Budget::Interval.belonging_to(current_user).for(
            month: params.fetch(:month),
            year: params.fetch(:year)
          )
        end

        def redirect_url
          params.fetch(:redirect_to)
        end
      end
    end
  end
end
