class RemoveAmountColumnFromBudgetItems < ActiveRecord::Migration[6.0]

  def up
    remove_column :budget_items, :amount
  end

  def down
    add_column :budget_items, :amount, :integer, null: false
  end
end
