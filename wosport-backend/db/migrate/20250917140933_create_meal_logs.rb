class CreateMealLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :meal_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.date :ate_on
      t.integer :meal_type
      t.text :note

      t.timestamps
    end
  end
end
