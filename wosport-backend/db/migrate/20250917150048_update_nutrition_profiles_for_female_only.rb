class UpdateNutritionProfilesForFemaleOnly < ActiveRecord::Migration[7.1]
  def change
    if column_exists?(:nutrition_profiles, :gender)
      remove_column :nutrition_profiles, :gender, :integer
    end

    add_column :nutrition_profiles, :cycle_length, :integer, default: 28 unless column_exists?(:nutrition_profiles, :cycle_length)
    add_column :nutrition_profiles, :period_length, :integer, default: 5 unless column_exists?(:nutrition_profiles, :period_length)
    add_column :nutrition_profiles, :last_period_start, :date unless column_exists?(:nutrition_profiles, :last_period_start)
  end
end
