# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    # Add `node(id: ID!) and `nodes(ids: [ID!]!)`
    include GraphQL::Types::Relay::HasNodeField
    include GraphQL::Types::Relay::HasNodesField

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :accounts, [AccountType], null: false do
      description 'Fetch the Accounts'
      argument :include_inactive, Boolean, required: false
    end

    def accounts(include_inactive: false)
      scope = AccountWithBalanceView.all
      scope = scope.where(archived_at: nil) unless include_inactive
      scope.map(&:as_presenter)
    end

    field :account, AccountType, null: true do
      description 'Fetch an Account by id'
      argument :slug, String, required: true
    end

    def account(slug:)
      Account.find_by(slug: slug)&.then do |acct|
        Presenters::AccountPresenter.new(acct)
      end
    end

    field :budget, Budget::NamespaceType, null: false do
      description 'Namespace for all things related to the budget'
    end

    def budget
      Presenters::Budget::NamespacePresenter.new
    end
  end
end
