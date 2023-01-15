class AddKeyToTransactionEntry < ActiveRecord::Migration[7.0]
  def change
    add_column :transaction_entries, :key, :string, limit: 12
  end
end
