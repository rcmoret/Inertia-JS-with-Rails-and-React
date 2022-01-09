# frozen_string_literal: true

module Accounts
  class ListController < ApplicationController
    include GraphQuery
    def index
      render inertia: 'AccountIndexApp', props: props
    end

    private

    def query
      <<-GQL
        {
          accounts(includeInactive: #{include_archived?}) {
            id
            name
            archivedAt
            isArchived
            isCashFlow
            priority
            slug
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
      'accounts'
    end
  end
end
