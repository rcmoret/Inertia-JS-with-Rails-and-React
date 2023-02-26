class AddForeignKeyOnBudgetEvents < ActiveRecord::Migration[7.0]
  def change
    add_foreign_key :budget_item_events, :budget_items, null: false
  end
end
