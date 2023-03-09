class AddUniqueAndNullConstraintsToNewKeyColumns < ActiveRecord::Migration[7.0]
  def change
    add_index :accounts, :key, unique: true
    add_index :icons, :key, unique: true
    add_index :users, :key, unique: true
    add_index :user_groups, :key, unique: true
    add_index :budget_categories, :key, unique: true
    change_column_null :accounts, :key, false
    change_column_null :icons, :key, false
    change_column_null :users, :key, false
    change_column_null :user_groups, :key, false
    change_column_null :budget_categories, :key, false
  end
end
