class AddNotNullContraintToTransactionDetailKey < ActiveRecord::Migration[7.0]
  def change
    change_column_null :transaction_details, :key, true
  end
end
