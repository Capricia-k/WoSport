class Reaction < ApplicationRecord
  belongs_to :story
  belongs_to :user

  validates :reaction_type, presence: true
  validates :user_id, uniqueness: { scope: :story_id }

  enum reaction_type: {
    like: 0,
    love: 1,
    laugh: 2,
    surprise: 3,
    sad: 4,
    angry: 5
  }
end