class AddUserIdToBudgetItemEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :budget_item_events, :user_id, :integer, null: true
  end
end
