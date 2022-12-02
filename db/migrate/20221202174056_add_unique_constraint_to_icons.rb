class AddUniqueConstraintToIcons < ActiveRecord::Migration[7.0]
  def change
    add_index :icons, :name, unique: true
    add_index :icons, :class_name, unique: true
  end
end
