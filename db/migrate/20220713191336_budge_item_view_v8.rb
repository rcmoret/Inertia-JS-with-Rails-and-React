class BudgeItemViewV8 < ActiveRecord::Migration[6.1]
  VIEW_NAME = 'budget_item_views'

  def up
    execute <<-SQL
      DROP VIEW IF EXISTS budget_item_event_view;
      DROP VIEW IF EXISTS #{VIEW_NAME};

      CREATE VIEW #{VIEW_NAME} AS
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
    SQL
  end

  def down
    execute("DROP VIEW if exists budget_item_event_view")
    execute("DROP VIEW if exists #{VIEW_NAME}")
  end
end
