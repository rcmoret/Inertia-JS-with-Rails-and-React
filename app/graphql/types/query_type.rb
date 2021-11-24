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
      Queries::AccountsQuery.execute(include_inactive: include_inactive)
    end

    field :account, AccountType, null: false do
      description 'Fetch an Account by id'
      argument :id, Integer, required: true
    end

    def account(id:)
      Account.find(id).then do |acct|
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
