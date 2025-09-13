class Story < ApplicationRecord
  belongs_to :user
  has_many_attached :media
  has_many :reactions, dependent: :destroy

  validates :expires_at, presence: true

  scope :active, -> { where('expires_at > ?', Time.current) }

  # Optional : schedule a cleanup job for this story after creation
  after_create_commit do
    # schedule job to destroy story after expires_at (works if you use activejob/sidekiq)
    CleanupExpiredStoriesJob.set(wait_until: expires_at).perform_later(id)
  end
end
