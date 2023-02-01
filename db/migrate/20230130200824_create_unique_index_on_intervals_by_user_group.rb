class CreateUniqueIndexOnIntervalsByUserGroup < ActiveRecord::Migration[7.0]
  def change
    add_index :budget_intervals, %i[month year user_group_id], unique: true
  end
end
