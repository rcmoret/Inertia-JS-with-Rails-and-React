class DropReceiptsColumn < ActiveRecord::Migration[6.0]
  UP_MIGRATION_1 = <<-SQL
      DROP VIEW if exists transaction_detail_view;

      CREATE VIEW transaction_detail_view AS
      SELECT
             d.*, -- details' details
             e.id AS "entry_id", -- entry details --
             e.account_id,
             e.clearance_date,
             e.description,
             e.budget_exclusion,
             e.notes,
             e.transfer_id,
             e.created_at AS "entry_created_at",
             e.updated_at AS "entry_updated_at", -- entry details ^ --
             a.name AS "account_name", -- account details --
             c.name AS "category_name", -- budget category details --
             ic.class_name AS "icon_class_name" -- icon details --
      FROM transaction_entries e
      JOIN transaction_details d ON d.transaction_entry_id = e.id
      JOIN accounts a on a.id = e.account_id
      LEFT OUTER JOIN budget_items item ON item.id = d.budget_item_id
      LEFT OUTER JOIN budget_categories c ON c.id = item.budget_category_id
      LEFT OUTER JOIN icons ic ON ic.id = c.icon_id;

      DROP VIEW if exists transaction_view;
    SQL

  UP_MIGRATION_2 = <<-SQL
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

  ROLLBACK_MIGRATION = <<-SQL
      DROP VIEW if exists transaction_detail_view;
      CREATE VIEW transaction_detail_view AS
      SELECT
             d.*, -- details' details
             e.id AS "entry_id", -- entry details --
             e.account_id,
             e.clearance_date,
             e.description,
             e.budget_exclusion,
             e.notes,
             e.transfer_id,
             e.receipt,
             e.created_at AS "entry_created_at",
             e.updated_at AS "entry_updated_at", -- entry details ^ --
             a.name AS "account_name", -- account details --
             c.name AS "category_name", -- budget category details --
             ic.class_name AS "icon_class_name" -- icon details --
      FROM transaction_entries e
      JOIN transaction_details d ON d.transaction_entry_id = e.id
      JOIN accounts a on a.id = e.account_id
      LEFT OUTER JOIN budget_items item ON item.id = d.budget_item_id
      LEFT OUTER JOIN budget_categories c ON c.id = item.budget_category_id
      LEFT OUTER JOIN icons ic ON ic.id = c.icon_id;

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

  def up
    execute(UP_MIGRATION_1)
    remove_column :transaction_entries, :receipt, :string
    execute(UP_MIGRATION_2)
  end

  def down
    add_column :transaction_entries, :receipt, :string
    execute(ROLLBACK_MIGRATION)
  end
end
