class CreateUserEventTypes < ActiveRecord::Migration[7.0]
  def up
    create_table :user_event_types do |t|
      t.string :name, limit: 100, null: false, index: { unique: true }
      t.boolean :is_client_recordable, null: false, default: false
      t.boolean :is_interal_recordable, null: false, default: true

      t.timestamps
    end

    execute('ALTER TABLE user_event_types add constraint is_recordable check (is_client_recordable or is_interal_recordable)')
  end

  def down
    execute('ALTER TABLE user_event_types drop constraint is_recordable')
    drop_table :user_event_types
  end
end
