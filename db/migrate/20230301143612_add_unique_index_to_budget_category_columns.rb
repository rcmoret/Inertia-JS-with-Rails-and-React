class AddUniqueIndexToBudgetCategoryColumns < ActiveRecord::Migration[7.0]
  def up
    remove_index :budget_categories, :slug
    add_index :budget_categories, %i[slug user_group_id], unique: true, where: "archived_at is null"
    add_index :budget_categories, %i[name user_group_id], unique: true, where: "archived_at is null"
  end

  def down
    add_index :budget_categories, :slug, unique: true
    remove_index :budget_categories, %i[slug user_group_id]
    remove_index :budget_categories, %i[name user_group_id]
  end
end
