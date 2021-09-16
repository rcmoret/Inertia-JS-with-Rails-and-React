class TransactionEntryView < ActiveRecord::Migration[5.1]

  def up
    execute %(
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
    )
  end

  def down
    execute('DROP VIEW if exists transaction_view')
  end
end
