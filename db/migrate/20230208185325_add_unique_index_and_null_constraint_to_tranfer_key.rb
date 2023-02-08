class AddUniqueIndexAndNullConstraintToTranferKey < ActiveRecord::Migration[7.0]
  def change
    add_index :transfers, :key, unique: true
    change_column_null :transfers, :key, true
  end
end
