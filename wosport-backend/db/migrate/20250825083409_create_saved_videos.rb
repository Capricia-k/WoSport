class CreateSavedVideos < ActiveRecord::Migration[7.1]
  def change
    create_table :saved_videos do |t|
      t.string :title
      t.string :video_url
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
