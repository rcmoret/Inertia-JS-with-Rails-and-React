class ChangeUserIdNullOnBudgetItemEvents < ActiveRecord::Migration[7.0]
  def change
    change_column_null :budget_item_events, :user_id, false
  end
end
