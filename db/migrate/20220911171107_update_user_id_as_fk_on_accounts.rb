class UpdateUserIdAsFkOnAccounts < ActiveRecord::Migration[7.0]
  def change
    add_foreign_key :accounts, :users
  end
end
