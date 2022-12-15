class AddUniqueContrainstToDetailKeys < ActiveRecord::Migration[7.0]
  def change
    add_index :transaction_details, :key, unique: :true
  end
end
