class AddKeysToRemainingTables < ActiveRecord::Migration[7.0]
  def change
    add_column :accounts, :key, :string, limit: 12, null: true
    add_column :users, :key, :string, limit: 12, null: true
    add_column :user_groups, :key, :string, limit: 12, null: true
    add_column :icons, :key, :string, limit: 12, null: true
    add_column :budget_categories, :key, :string, limit: 12, null: true
  end
end
