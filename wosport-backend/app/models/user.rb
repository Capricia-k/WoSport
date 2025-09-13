class User < ApplicationRecord
  enum profile_visibility: { everyone: 0, friends: 1, only_me: 2 }
  has_one_attached :avatar
  has_many :cycles, dependent: :destroy
  has_many :saved_videos, dependent: :destroy
  has_many :sessions
  has_many :contacts
  has_many :sos_alerts
  has_many :posts
  has_many :comments, dependent: :destroy

  has_many :follower_relationships, class_name: 'Follow', foreign_key: :followed_id, dependent: :destroy
  has_many :followers, through: :follower_relationships, source: :follower

  has_many :following_relationships, class_name: 'Follow', foreign_key: :follower_id, dependent: :destroy
  has_many :following, through: :following_relationships, source: :followed

  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id'
  has_many :stories, dependent: :destroy
  has_many :reactions, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  include Rails.application.routes.url_helpers

  def avatar_url
    if avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(avatar, only_path: false)
    else
      "https://ui-avatars.com/api/?name=#{first_name || 'Utilisateur'}&background=E24741&color=fff"
    end
  end

  def avatar_thumb
    avatar.attached? ? url_for(avatar.variant(resize_to_limit: [100, 100])) : avatar_url
  end
end
