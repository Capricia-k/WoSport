class Workout < ApplicationRecord
  validates :title, :category, :duration, :level, :video_url, presence: true
  def thumbnail_url
    file_name = video_url.split('/').last.gsub('.mp4', '.jpg')
    "https://res.cloudinary.com/dx16ewfq2/video/upload/w_300,h_200,c_fill/#{file_name}"
  end
end
