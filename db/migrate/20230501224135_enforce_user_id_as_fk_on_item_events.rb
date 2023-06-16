class EnforceUserIdAsFkOnItemEvents < ActiveRecord::Migration[7.0]
  def change
    add_foreign_key :budget_item_events, :users, validate: true
  end
end
