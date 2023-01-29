class AddNullConstraintOnUserGroupId < ActiveRecord::Migration[7.0]
  def change
    change_column_null :users, :user_group_id, false
  end
end
