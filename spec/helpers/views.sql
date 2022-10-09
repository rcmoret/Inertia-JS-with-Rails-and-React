DROP VIEW IF EXISTS account_with_balance_view;
DROP VIEW IF EXISTS transaction_view;
DROP VIEW IF EXISTS transaction_detail_view;
DROP VIEW IF EXISTS budget_item_event_view;
DROP VIEW IF EXISTS budget_item_views;
DROP VIEW IF EXISTS maturity_intervals_view;

CREATE VIEW maturity_intervals_view AS
  SELECT mi.id, mi.budget_category_id, mi.budget_interval_id, i.month, i.year
  FROM budget_category_maturity_intervals mi
  JOIN budget_intervals i ON i.id = mi.budget_interval_id;

CREATE VIEW budget_item_views AS
  SELECT i.id,
    i.key,
    i.budget_category_id AS budget_category_id,
    i.budget_interval_id,
    i.deleted_at,
    c.name AS name,
    c.expense AS expense,
    c.monthly AS monthly,
    c.accrual AS accrual,
    c.is_per_diem_enabled AS is_per_diem_enabled,
    bi.month AS month,
    bi.year AS year,
    ic.class_name AS icon_class_name,
    (SELECT COALESCE(SUM(ev.amount), 0) FROM budget_item_events ev WHERE i.id = ev.budget_item_id) AS amount,
    (SELECT COUNT(td.id) FROM transaction_details td WHERE i.id = td.budget_item_id) AS transaction_count,
    (SELECT COALESCE(SUM(td.amount), 0) FROM transaction_details td WHERE i.id = td.budget_item_id) AS spent,
    (SELECT MIN(mi.month)
          FROM maturity_intervals_view mi
          WHERE mi.budget_category_id = i.budget_category_id
          AND (mi.year > bi.year OR (mi.year = bi.year and mi.month >= bi.month))
    ) AS maturity_month,
    (SELECT MIN(mi.year)
          FROM maturity_intervals_view mi
          WHERE mi.budget_category_id = i.budget_category_id
          AND (mi.year > bi.year OR (mi.year = bi.year and mi.month >= bi.month))
    ) AS maturity_year
  FROM budget_items i
  JOIN budget_categories c ON c.id = i.budget_category_id
  JOIN budget_intervals bi ON bi.id = i.budget_interval_id
  LEFT JOIN icons ic ON ic.id = c.icon_id;

CREATE VIEW budget_item_event_view AS
  SELECT ev.id,
         v.name AS "category_name",
         evt.name AS "event_type_name",
         ev.amount AS "amount",
         ev.data AS "data",
         v.month AS "month",
         v.year AS "year",
         v.icon_class_name AS "icon_class_name",
         ev.created_at,
         ev.updated_at
  FROM budget_item_events ev
  JOIN budget_item_views v ON v.id = ev.budget_item_id
  JOIN budget_item_event_types evt on evt.id = ev.budget_item_event_type_id;

CREATE VIEW account_with_balance_view AS
  SELECT accounts.*, COALESCE(sum(transaction_details.amount), 0) as balance
  FROM accounts
  LEFT OUTER JOIN transaction_entries ON transaction_entries.account_id = accounts.id
  LEFT OUTER JOIN transaction_details ON transaction_details.transaction_entry_id = transaction_entries.id
  GROUP BY accounts.id;

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
    AND receipts.name = 'receipt';

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
