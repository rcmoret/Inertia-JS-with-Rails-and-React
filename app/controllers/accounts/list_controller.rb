# frozen_string_literal: true

module Accounts
  class ListController < ApplicationController
    include GraphQuery
    include AccountAdminHelpers
    include InertiaHelpers

    def index
      render inertia_response component: COMPONENT, data: props
    end

    private

    def additional_props
      { includes_archived: include_archived? }
    end
  end
end
