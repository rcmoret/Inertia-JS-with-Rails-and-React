# frozen_string_literal: true

module Accounts
  class CreateController < ApplicationController
    include GraphQuery
    include AccountAdminHelpers
    include InertiaHelpers

    def call
      if account.save
        render inertia_response component: COMPONENT, data: success_props, status: :created
      else
        render inertia_response component: COMPONENT, data: error_props, status: :unprocessable_entity
      end
    end

    private

    def create_params
      params.require(:account).permit(
        :name,
        :is_cash_flow,
        :cash_flow,
        :priority,
        :slug
      )
    end

    def account
      @account ||= Account.belonging_to(current_user).build(create_params)
    end

    def success_props
      props.merge(accounts: data.fetch('accounts').map do |acct|
        next acct unless acct.fetch('slug') == account.slug

        acct.merge(notice: { level: 'info', message: 'Account Created Successfully' })
      end)
    end

    def error_props
      props.merge(
        new_account: {
          updated_attributes: create_params.to_hash,
          notice: { level: 'error', message: 'An error caused your account to not be saved' },
          attribute_errors: account.errors.to_hash,
        }
      )
    end
  end
end
