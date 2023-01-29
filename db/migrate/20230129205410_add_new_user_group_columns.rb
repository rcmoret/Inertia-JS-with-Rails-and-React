class AddNewUserGroupColumns < ActiveRecord::Migration[7.0]
  def change
    add_reference :accounts, :user_group, foreign_key: true, null: true
    add_reference :budget_categories, :user_group, foreign_key: true, null: true
    add_reference :budget_intervals, :user_group, foreign_key: true, null: true
  end
end
