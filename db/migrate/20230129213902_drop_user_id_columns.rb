class DropUserIdColumns < ActiveRecord::Migration[7.0]
  def change
    remove_column :accounts, :user_id, :integer
    remove_column :budget_categories, :user_id, :integer
    remove_column :budget_intervals, :user_id, :integer
  end
end
