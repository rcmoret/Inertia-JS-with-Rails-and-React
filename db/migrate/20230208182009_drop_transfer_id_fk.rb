class DropTransferIdFk < ActiveRecord::Migration[7.0]
  def up
    remove_column :transaction_entries, :transfer_id
  end

  def down
    add_reference :transaction_entries, :transfer, null: true, foreign_key: true
  end
end
