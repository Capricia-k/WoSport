class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  belongs_to :post, optional: true
  validates :content, presence: true, unless: -> { post.present? }

  scope :unread, -> { where(read: false) }
end
