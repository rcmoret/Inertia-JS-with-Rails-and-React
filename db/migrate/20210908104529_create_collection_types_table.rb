class CreateCollectionTypesTable < ActiveRecord::Migration[6.0]
  def change
    create_table :collection_types do |t|
      t.string :name, limit: 400, null: false
      t.timestamps
    end
  end
end
