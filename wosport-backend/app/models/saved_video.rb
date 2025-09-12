class SavedVideo < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :video_url, presence: true
end
