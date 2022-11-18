# frozen_string_literal: true

module Accounts
  class TransactionsController < ApplicationController
    before_action :set_selected_account_info
    before_action :redirect_to_current, if: -> { month.nil? || year.nil? }
    before_action :redirect_to_slug, unless: -> { slug == identifier }

    include GraphQuery
    include GraphQueries::AccountQueries

    def index
      render inertia: 'AccountTransactionsIndexApp', props: props
    end

    private

    def current_interval
      Budget::Interval.current
    end

    def identifier
      params[:identifier].then do |identifier_param|
        if identifier_param.match(/\A\d+\z/)
          identifier_param.to_i
        else
          identifier_param
        end
      end
    end

    def redirect_to_current
      redirect_to account_transactions_path(slug, month: current_interval.month, year: current_interval.year)
    end

    def redirect_to_slug
      redirect_to account_transactions_path(slug, month: month, year: year)
    end

    def slug
      identifier.is_a?(Integer) ? Account.find(identifier).slug : identifier
    end

    def month
      params[:month]
    end

    def year
      params[:year]
    end

    def query
      account_transactions_query(current_user.id, slug, month, year)
    end

    def namespace
      'accounts'
    end

    def set_selected_account_info
      session[:selected_account_path] = [identifier, 'transactions', month, year].join('/')
    end
  end
end
