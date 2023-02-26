class AddFkToBudgetEventTypeId < ActiveRecord::Migration[7.0]
  def change
    add_foreign_key :budget_item_events, :budget_item_event_types
  end
end
