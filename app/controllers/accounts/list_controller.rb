# frozen_string_literal: true

module Accounts
  class ListController < ApplicationController
    include GraphQuery

    def index
      render inertia: 'AccountIndexApp', props: props
    end

    private

    def query
      GraphQueries::AccountQueries.full_accounts_belonging_to(current_user, include_archived: include_archived?)
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
