class AddUniqueConstraintToBudgetItems < ActiveRecord::Migration[7.0]
  def change
    add_index :budget_items, :key, unique: true
  end
end
