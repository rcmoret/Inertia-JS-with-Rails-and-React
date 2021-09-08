class CreateCollections < ActiveRecord::Migration[6.0]
  def change
    create_table :collections do |t|
      t.belongs_to :collection_type
      t.string :name, limit: 4000, null: false
      t.string :slug, limit: 250, null: false
      t.integer :year, null: true
      t.timestamps
    end

    add_index :collections, :name, unique: true
    add_index :collections, :slug, unique: true
  end
end
