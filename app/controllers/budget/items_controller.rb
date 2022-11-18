# frozen_string_literal: true

module Budget
  class ItemsController < ApplicationController
    include AccountsHelper
    include GraphQuery
    include GraphQueries::BudgetItems

    def index
      if month.nil? || year.nil?
        current_interval = Budget::Interval.current(user: current_user)
        redirect_to budget_path(month: current_interval.month, year: current_interval.year)
      else
        render inertia: 'BudgetItemIndexApp', props: props
      end
    end

    private

    def month
      params[:month]
    end

    def year
      params[:year]
    end

    def query
      budget_item_index_query(month: month, year: year, include_deleted: include_deleted?)
    end

    def include_deleted?
      params.fetch(:include_deleted, false) == 'true'
    end

    def namespace
      'budget'
    end

    def additional_props
      { includesDeleted: include_deleted?, selectedAccountPath: selected_account_path }
    end

    def set_selected_budget_info
      session[:selected_budget_path] = [slug, 'transactions', month, year].join('/')
    end
  end
end
