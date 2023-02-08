# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2023_02_08_185325) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "cash_flow", default: true
    t.integer "priority", null: false
    t.datetime "archived_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug", limit: 30
    t.bigint "user_group_id", null: false
    t.index ["user_group_id"], name: "index_accounts_on_user_group_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "budget_categories", force: :cascade do |t|
    t.string "name"
    t.integer "default_amount", null: false
    t.boolean "monthly", default: true, null: false
    t.boolean "expense", default: true, null: false
    t.boolean "accrual", default: false, null: false
    t.datetime "archived_at"
    t.bigint "icon_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.boolean "is_per_diem_enabled", default: false, null: false
    t.bigint "user_group_id", null: false
    t.index ["icon_id"], name: "index_budget_categories_on_icon_id"
    t.index ["slug"], name: "index_budget_categories_on_slug", unique: true
    t.index ["user_group_id"], name: "index_budget_categories_on_user_group_id"
  end

  create_table "budget_category_maturity_intervals", force: :cascade do |t|
    t.integer "budget_interval_id", null: false
    t.integer "budget_category_id", null: false
    t.index ["budget_category_id", "budget_interval_id"], name: "index_category_interval_uniqueness", unique: true
  end

  create_table "budget_intervals", force: :cascade do |t|
    t.integer "month", null: false
    t.integer "year", null: false
    t.datetime "set_up_completed_at"
    t.datetime "close_out_completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.bigint "user_group_id", null: false
    t.index ["month", "year", "user_group_id"], name: "index_budget_intervals_on_month_and_year_and_user_group_id", unique: true
    t.index ["user_group_id"], name: "index_budget_intervals_on_user_group_id"
  end

  create_table "budget_item_event_types", force: :cascade do |t|
    t.string "name", limit: 50, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["name"], name: "index_budget_item_event_types_on_name", unique: true
  end

  create_table "budget_item_events", force: :cascade do |t|
    t.integer "budget_item_id"
    t.integer "budget_item_event_type_id"
    t.integer "amount", null: false
    t.json "data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "key", limit: 12
    t.index ["budget_item_event_type_id"], name: "index_budget_item_events_on_budget_item_event_type_id"
    t.index ["budget_item_id"], name: "index_budget_item_events_on_budget_item_id"
    t.index ["key"], name: "index_budget_item_events_on_key", unique: true
  end

  create_table "budget_items", force: :cascade do |t|
    t.bigint "budget_category_id", null: false
    t.bigint "budget_interval_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.string "key", limit: 12, null: false
    t.index ["budget_category_id"], name: "index_budget_items_on_budget_category_id"
    t.index ["budget_interval_id"], name: "index_budget_items_on_budget_interval_id"
    t.index ["key"], name: "index_budget_items_on_key", unique: true
  end

  create_table "icons", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.string "class_name", limit: 100, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["class_name"], name: "index_icons_on_class_name", unique: true
    t.index ["name"], name: "index_icons_on_name", unique: true
  end

  create_table "transaction_details", force: :cascade do |t|
    t.bigint "transaction_entry_id", null: false
    t.bigint "budget_item_id"
    t.integer "amount", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "key", limit: 12
    t.index ["budget_item_id"], name: "index_transaction_details_on_budget_item_id"
    t.index ["key"], name: "index_transaction_details_on_key", unique: true
    t.index ["transaction_entry_id"], name: "index_transaction_details_on_transaction_entry_id"
  end

  create_table "transaction_entries", force: :cascade do |t|
    t.string "description", limit: 255
    t.string "check_number", limit: 12
    t.date "clearance_date"
    t.bigint "account_id", null: false
    t.text "notes"
    t.boolean "budget_exclusion", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "key", limit: 12
    t.index ["account_id"], name: "index_transaction_entries_on_account_id"
  end

  create_table "transfers", force: :cascade do |t|
    t.integer "to_transaction_id"
    t.integer "from_transaction_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "key", limit: 12
    t.index ["key"], name: "index_transfers_on_key", unique: true
  end

  create_table "user_groups", force: :cascade do |t|
    t.string "name", limit: 200, null: false
    t.string "primary_email", limit: 200, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["primary_email"], name: "index_user_groups_on_primary_email", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "user_group_id", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["user_group_id"], name: "index_users_on_user_group_id"
  end

  add_foreign_key "accounts", "user_groups"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "budget_categories", "icons"
  add_foreign_key "budget_categories", "user_groups"
  add_foreign_key "budget_category_maturity_intervals", "budget_categories"
  add_foreign_key "budget_category_maturity_intervals", "budget_intervals"
  add_foreign_key "budget_intervals", "user_groups"
  add_foreign_key "budget_items", "budget_categories"
  add_foreign_key "budget_items", "budget_intervals"
  add_foreign_key "transaction_details", "budget_items"
  add_foreign_key "transaction_details", "transaction_entries"
  add_foreign_key "transaction_entries", "accounts"
  add_foreign_key "users", "user_groups"
end
