class AddArtistsTable < ActiveRecord::Migration[6.0]
  def change
    create_table :artists do |t|
      t.string :name, limit: 400, null: false
      t.timestamps
    end
  end
end
