class UpdateAccountWithBalaceView < ActiveRecord::Migration[7.0]
  def change
    execute('DROP VIEW if exists account_with_balance_view')

    execute <<-SQL
      CREATE VIEW account_with_balance_view AS
        SELECT accounts.*, sum(transaction_details.amount) as balance
        FROM accounts
        JOIN transaction_entries ON transaction_entries.account_id = accounts.id
        JOIN transaction_details ON transaction_details.transaction_entry_id = transaction_entries.id
        GROUP BY accounts.id
    SQL
  end
end
