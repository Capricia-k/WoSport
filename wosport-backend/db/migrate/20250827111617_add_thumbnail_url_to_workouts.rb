class AddThumbnailUrlToWorkouts < ActiveRecord::Migration[7.1]
  def change
    add_column :workouts, :thumbnail_url, :string
  end
end
