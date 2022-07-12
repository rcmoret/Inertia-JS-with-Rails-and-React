class CreatePerDiemConfigs < ActiveRecord::Migration[6.1]
  def change
    add_column :budget_categories, :is_per_diem_enabled, :boolean, null: false, default: false
  end
end
