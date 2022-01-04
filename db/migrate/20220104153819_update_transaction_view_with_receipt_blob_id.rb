class UpdateTransactionViewWithReceiptBlobId < ActiveRecord::Migration[6.0]
  def up
    execute <<-SQL
      DROP VIEW if exists transaction_view;

      CREATE VIEW transaction_view AS
        SELECT t.*,
               receipts.blob_id AS "receipt_blob_id",
               TO_JSON(ARRAY(
                 SELECT JSON_BUILD_OBJECT(
                   'id', detail.id,
                   'amount', detail.amount,
                   'budget_item_id', detail.budget_item_id,
                   'budget_category_id', c.id,
                   'budget_category_name', c.name,
                   'icon_class_name', ic.class_name
                 )
                 FROM transaction_details detail
                 LEFT OUTER JOIN budget_items i ON i.id = detail.budget_item_id
                 LEFT JOIN budget_categories c ON c.id = i.budget_category_id
                 LEFT JOIN icons ic ON ic.id = c.icon_id
                 WHERE detail.transaction_entry_id = t.id
               )) AS "details"
        FROM transaction_entries t
        LEFT JOIN accounts a ON a.id = t.account_id
        LEFT OUTER JOIN active_storage_attachments receipts ON
          receipts.record_id = t.id
          AND receipts.record_type = 'Transaction::Entry'
          AND receipts.name = 'receipt'
    SQL
  end

  def down
    execute <<-SQL
      DROP VIEW if exists transaction_view;

      CREATE VIEW transaction_view AS
        SELECT t.*,
               a.name AS "account_name",
               TO_JSON(ARRAY(
                 SELECT JSON_BUILD_OBJECT(
                   'id', detail.id,
                   'budget_category', c.name,
                   'budget_item_id', detail.budget_item_id,
                   'amount', detail.amount,
                   'icon_class_name', ic.class_name
                 )
                 FROM transaction_details detail
                 LEFT OUTER JOIN budget_items i ON i.id = detail.budget_item_id
                 LEFT JOIN budget_categories c ON c.id = i.budget_category_id
                 LEFT JOIN icons ic ON ic.id = c.icon_id
                 WHERE detail.transaction_entry_id = t.id
               )) AS "details"
        FROM transaction_entries t
        LEFT JOIN accounts a ON a.id = t.account_id
    SQL
  end
end
