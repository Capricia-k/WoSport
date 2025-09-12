class CreateWorkouts < ActiveRecord::Migration[7.1]
  def change
    create_table :workouts do |t|
      t.string :title
      t.integer :duration
      t.string :level
      t.string :video_url

      t.timestamps
    end
  end
end
