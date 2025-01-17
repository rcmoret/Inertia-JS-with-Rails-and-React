# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    # Add `node(id: ID!) and `nodes(ids: [ID!]!)`
    include GraphQL::Types::Relay::HasNodeField
    include GraphQL::Types::Relay::HasNodesField

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :accounts, [AccountType], null: false do
      description "Fetch the user's accounts"
      argument :user_id, Integer, required: true
      argument :include_archived, Boolean, required: false
    end

    def accounts(user_id:, include_archived: false)
      User.find(user_id).then do |user|
        Queries::Accounts::AllWithBalance.new(user: user, include_archived: include_archived).call(&:as_presenter)
      end
    end

    field :account, AccountType, null: true do
      description 'Fetch an Account by id'
      argument :user_id, Integer, required: true
      argument :slug, String, required: true
    end

    def account(slug:, user_id:)
      User.find(user_id).then do |user|
        Account.fetch(user: user, identifier: slug)&.then do |acct|
          Presenters::AccountPresenter.new(acct)
        end
      end
    end

    field :budget, Budget::NamespaceType, null: false do
      description 'Namespace for all things related to the budget'
      argument :user_id, Integer, required: true
    end

    def budget(user_id:)
      Presenters::Budget::NamespacePresenter.new(user_id)
    end
  end
end
