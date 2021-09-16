class AddStartAndEndDateToBudgetInterval < ActiveRecord::Migration[6.0]
  def change
    change_table :budget_intervals do |t|
      t.column :start_date, :datetime
      t.column :end_date, :datetime
    end
  end
end
