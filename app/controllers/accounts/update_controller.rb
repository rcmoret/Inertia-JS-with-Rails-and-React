# frozen_string_literal: true

module Accounts
  class UpdateController < ApplicationController
    include GraphQuery
    include AccountAdminHelpers
    include InertiaHelpers

    def call
      if account.update(update_params)
        render inertia_response component: COMPONENT, data: success_props, status: :accepted
      else
        render inertia_response component: COMPONENT, data: error_props, status: :unprocessable_entity
      end
    end

    private

    def update_params
      params.require(:account).permit(
        :name,
        :archived_at,
        :is_cash_flow,
        :cash_flow,
        :priority,
        :slug
      )
    end

    def success_props
      props.merge(accounts: data.fetch('accounts').map do |acct|
        next acct unless acct.fetch('slug') == account.slug

        acct.merge(notice: { level: 'info', message: 'Account Updated Successfully' })
      end)
    end

    def error_props
      props.merge(accounts: data.fetch('accounts').map do |acct|
        next acct unless acct.fetch('slug') == slug

        acct.merge(
          attribute_errors: account.errors.to_hash,
          notice: { level: 'error', message: 'An error caused your account not to be updated' },
          updated_attributes: update_params.to_hash
        )
      end)
    end

    def account
      @account ||= Account.fetch(user: current_user, identifier: slug)
    end

    def slug
      params.require(:slug)
    end
  end
end
