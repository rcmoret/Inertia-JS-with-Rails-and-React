class AddUniqueConstraintToBudgetItemEvents < ActiveRecord::Migration[7.0]
  def change
    add_index :budget_item_events, :key, unique: :true
  end
end
