class ChangeUserGroupIdNullConstraint < ActiveRecord::Migration[7.0]
  def change
    change_column_null :accounts, :user_group_id, false
    change_column_null :budget_categories, :user_group_id, false
    change_column_null :budget_intervals, :user_group_id, false
  end
end
