class AddKeyToBudgetItemEvent < ActiveRecord::Migration[7.0]
  def change
    add_column :budget_item_events, :key, :string, limit: 12
  end
end
