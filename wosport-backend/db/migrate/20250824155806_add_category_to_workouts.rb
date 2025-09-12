class AddCategoryToWorkouts < ActiveRecord::Migration[7.1]
  def change
    add_column :workouts, :category, :string
  end
end
