class AddCycleTrackingToNutritionProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :nutrition_profiles, :cycle_length, :integer
    add_column :nutrition_profiles, :period_length, :integer
    add_column :nutrition_profiles, :last_period_start, :date
  end
end
