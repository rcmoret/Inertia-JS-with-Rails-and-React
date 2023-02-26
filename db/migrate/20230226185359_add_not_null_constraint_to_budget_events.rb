class AddNotNullConstraintToBudgetEvents < ActiveRecord::Migration[7.0]
  def change
    change_column_null :budget_item_events, :budget_item_event_type_id, false
    change_column_null :budget_item_events, :budget_item_id, false
  end
end
