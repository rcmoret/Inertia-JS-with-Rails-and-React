class CreateUserGroups < ActiveRecord::Migration[7.0]
  def change
    create_table :user_groups do |t|
      t.string :name, null: false, limit: 200
      t.string :primary_email, null: false, limit: 200, index: { unique: true }

      t.timestamps
    end
  end
end
