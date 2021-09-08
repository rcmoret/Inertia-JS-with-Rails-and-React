class AddArtistsTable < ActiveRecord::Migration[6.0]
  def change
    create_table :artists do |t|
      t.string :name, limit: 4000, null: false
      t.string :slug, limit: 250, null: false
      t.timestamps
    end

    add_index :artists, :name, unique: true
    add_index :artists, :slug, unique: true
  end
end
