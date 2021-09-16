module Types
  class AccountType < BaseObject
    field :name, String, 'Account name', null: false
    field :slug, String, 'Account slug name', null: false
    field :balance, Integer, 'Total of accounts transactions', null: false
  end
end
