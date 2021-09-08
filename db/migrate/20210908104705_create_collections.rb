class CreateCollections < ActiveRecord::Migration[6.0]
  def change
    create_table :collections do |t|
      t.belongs_to :collection_type
      t.string :name, limit: 4000, null: false
      t.integer :year, null: true
      t.timestamps
    end
  end
end
