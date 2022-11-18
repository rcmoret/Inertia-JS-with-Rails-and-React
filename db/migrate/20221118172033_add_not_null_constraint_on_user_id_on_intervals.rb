class AddNotNullConstraintOnUserIdOnIntervals < ActiveRecord::Migration[7.0]
  def change
    change_column_null :budget_intervals, :user_id, false
  end
end
