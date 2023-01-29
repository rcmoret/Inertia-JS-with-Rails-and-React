# frozen_string_literal: true

module Budget
  module Categories
    module MaturityIntervals
      class CreateController < ApplicationController
        def call
          if maturity_interval.save
            redirect_to redirect_url
          else
            render inertia: 'BudgetCategoryIndexApp', props: maturity_interval.errors
          end
        end

        private

        def maturity_interval
          @maturity_interval ||= Budget::CategoryMaturityInterval.new(interval: interval, category: category)
        end

        def category
          @category ||= Budget::Category.belonging_to(current_user).find_by!(slug: params.fetch(:slug))
        end

        def post_params
          params.require(:interval).permit(:month, :year)
        end

        def interval
          @interval ||= Budget::Interval.belonging_to(current_user).for(
            month: post_params[:month],
            year: post_params[:year]
          )
        end

        def redirect_url
          params.fetch(:redirect_to)
        end
      end
    end
  end
end
