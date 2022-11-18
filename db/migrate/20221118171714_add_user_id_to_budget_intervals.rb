class AddUserIdToBudgetIntervals < ActiveRecord::Migration[7.0]
  def change
    add_reference :budget_intervals, :user, foreign_key: true, null: true
  end
end
