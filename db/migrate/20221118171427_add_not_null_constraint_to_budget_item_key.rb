class AddNotNullConstraintToBudgetItemKey < ActiveRecord::Migration[7.0]
  def change
    change_column_null :budget_items, :key, false
  end
end
