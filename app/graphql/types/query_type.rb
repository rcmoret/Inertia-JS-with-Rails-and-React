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
      AccountsQuery.execute(include_inactive: include_inactive)
    end

    field :account, AccountType, null: false do
      description 'Fetch an Account by id'
      argument :id, Integer, required: true
    end

    def account(id:)
      Account.find(id).then do |acct|
        AccountPresenter.new(acct)
      end
    end

    field :categories, [Budget::CategoryType], null: false do
      description 'Budget Categories available'
    end

    def categories
      ::Budget::Category.all.map do |category|
        ::Budget::CategoryPresenter.new(category)
      end
    end

    field :category, Budget::CategoryType, null: false do
      description 'Budget Category by id'
      argument :id, Integer, required: true
    end

    def category(id:)
      ::Budget::Category.find(id).then do |budget_category|
        BudgetCategoryPresenter.new(budget_cateory)
      end
    end

    field :interval, Budget::IntervalType, null: false do
      description 'Budget Interval (month/year)'
      argument :month, Integer, required: false
      argument :year, Integer, required: false
    end

    def interval(month: Time.current.month, year: Time.current.year)
      ::Budget::Interval.for(month: month, year: year).then do |budget_interval|
        IntervalPresenter.new(budget_interval)
      end
    end
  end
end
