class AddKeyToTransactionDetails < ActiveRecord::Migration[7.0]
  def change
    add_column :transaction_details, :key, :string, limit: 12
  end
end
