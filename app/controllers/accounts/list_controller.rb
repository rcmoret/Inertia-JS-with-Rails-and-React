# frozen_string_literal: true

module Accounts
  class ListController < ApplicationController
    include GraphQuery
    include GraphQueries::AccountQueries
    def index
      render inertia: 'AccountIndexApp', props: props
    end

    private

    def query
      full_accounts_for(current_user, include_archived: include_archived?)
    end

    def include_archived?
      params.fetch(:include_archived, false) == 'true'
    end

    def additional_props
      { includesArchived: include_archived? }
    end

    def namespace
      'accounts'
    end
  end
end
