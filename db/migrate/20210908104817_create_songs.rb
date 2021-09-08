class CreateSongs < ActiveRecord::Migration[6.0]
  def change
    create_table :songs do |t|
      t.belongs_to :artist
      t.belongs_to :collection
      t.string :name, limit: 4000, null: false
      t.timestamps
    end
  end
end
