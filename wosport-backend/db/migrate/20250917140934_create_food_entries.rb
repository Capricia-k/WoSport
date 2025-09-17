class CreateFoodEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :food_entries do |t|
      t.references :meal_log, null: false, foreign_key: true
      t.string :source
      t.string :external_id
      t.string :name
      t.string :brand
      t.decimal :serving_qty
      t.string :serving_unit
      t.decimal :kcal
      t.decimal :protein_g
      t.decimal :carbs_g
      t.decimal :fat_g
      t.decimal :fiber_g
      t.decimal :sugar_g
      t.integer :sodium_mg
      t.string :off_barcode

      t.timestamps
    end
  end
end
