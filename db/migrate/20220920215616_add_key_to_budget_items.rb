class AddKeyToBudgetItems < ActiveRecord::Migration[7.0]
  def change
    add_column :budget_items, :key, :string, limit: 12
  end
end
