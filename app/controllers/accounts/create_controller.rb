# frozen_string_literal: true

module Accounts
  class CreateController < ApplicationController
    def call
      if account.save
        redirect_to redirect_url
      else
        render inertia: 'AccountsIndexApp', props: account.errors
      end
    end

    private

    def create_params
      params.require(:account).permit(
        :name,
        :cash_flow,
        :priority,
        :slug
      )
    end

    def redirect_url
      if include_archived?
        accounts_path(include_archived: true)
      else
        accounts_path
      end
    end

    def account
      @account ||= Account.new(create_params)
    end

    def include_archived?
      params.fetch(:include_archived, false) == 'true'
    end
  end
end
