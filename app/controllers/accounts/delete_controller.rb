# frozen_string_literal: true

module Accounts
  class DeleteController < ApplicationController
    def call
      if account.destroy
        redirect_to redirect_url
      else
        render inertia: 'AccountsIndexApp', props: account.errors
      end
    end

    private

    def redirect_url
      if include_archived?
        accounts_path(include_archived: true)
      else
        accounts_path
      end
    end

    def account
      @account ||= Account.find(params.fetch(:id))
    end

    def include_archived?
      params.fetch(:include_archived, false) == 'true'
    end
  end
end
