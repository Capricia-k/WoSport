class Post < ApplicationRecord
  VISIBILITIES = %w[public private friends].freeze

  validates :visibility, inclusion: { in: VISIBILITIES }

  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :encouragements, dependent: :destroy
  has_many :messages, dependent: :destroy

  has_many_attached :photos
  has_many_attached :videos

  def photo_urls
    photos.map { |photo| photo.service_url } if photos.attached?
  end

  def video_urls
    videos.map { |video| video.service_url } if videos.attached?
  end

  def comments_count
    self[:comments_count] || comments.size
  end

  def encouragements_count
    self[:encouragements_count] || encouragements.size
  end
end
