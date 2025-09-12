class CreateCycles < ActiveRecord::Migration[7.1]
  def change
    create_table :cycles do |t|
      t.references :user, null: false, foreign_key: true
      t.date :start_date
      t.date :end_date
      t.json :symptoms
      t.text :notes

      t.timestamps
    end
  end
end
