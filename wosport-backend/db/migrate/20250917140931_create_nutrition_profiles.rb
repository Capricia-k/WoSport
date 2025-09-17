class CreateNutritionProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :nutrition_profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.date :birth_date
      t.integer :height_cm
      t.decimal :weight_kg
      t.integer :activity_level
      t.integer :goal
      t.integer :calorie_target
      t.integer :protein_target_g
      t.integer :carbs_target_g
      t.integer :fat_target_g

      t.timestamps
    end
  end
end
