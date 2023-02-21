class CreateRoles < ActiveRecord::Migration[7.0]
  def change
    create_table :roles do |t|
      t.string :name,
               limit: 100,
               null: false,
               index: { unique: true }

      t.timestamps
    end
  end
end
