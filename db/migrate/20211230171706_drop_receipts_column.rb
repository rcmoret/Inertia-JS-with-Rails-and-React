class DropReceiptsColumn < ActiveRecord::Migration[6.0]
  def up
    remove_column :transaction_entries, :receipt, :string
  end

  def down
    add_column :transaction_entries, :receipt, :string
  end
end
