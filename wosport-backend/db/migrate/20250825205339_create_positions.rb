class CreatePositions < ActiveRecord::Migration[7.1]
  def change
    create_table :positions do |t|
      t.references :session, null: false, foreign_key: true
      t.float :latitude
      t.float :longitude
      t.datetime :timestamp

      t.timestamps
    end
  end
end
