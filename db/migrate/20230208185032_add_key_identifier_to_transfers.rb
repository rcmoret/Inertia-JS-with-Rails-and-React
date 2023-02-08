class AddKeyIdentifierToTransfers < ActiveRecord::Migration[7.0]
  def change
    add_column :transfers, :key, :string, limit: 12, null: true
  end
end
