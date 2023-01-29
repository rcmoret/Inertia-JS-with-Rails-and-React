class AddUserGroupIdToUsers < ActiveRecord::Migration[7.0]
  def change
    add_reference :users, :user_group, foreign_key: true, null: true
  end
end
