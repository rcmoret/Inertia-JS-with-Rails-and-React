# frozen_string_literal: true

module Accounts
  class DeleteController < ApplicationController
    include GraphQuery
    include AccountAdminHelpers
    include InertiaHelpers

    def call
      if account.destroy
        render inertia_response component: COMPONENT, data: props, status: :accepted
      else
        render inertia_response component: COMPONENT, data: error_props, status: :unprocessable_entity
      end
    end

    private

    def error_props
      props.merge accounts: data.fetch('accounts').map do |acct|
        next acct unless acct.fetch('slug') == slug

        acct.merge(
          attribute_errors: account.errors.to_hash,
          notice: { level: 'error', message: 'An error caused your account not to be deleted' },
          updated_attributes: update_params.to_hash
        )
      end
    end

    def account
      @account ||= Account.fetch(user: current_user, identifier: slug)
    end

    def slug
      params.require(:slug)
    end
  end
end
