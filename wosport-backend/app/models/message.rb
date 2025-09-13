class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  belongs_to :post, optional: true
  validates :content, presence: true, unless: -> { post.present? }
  validates :content, presence: true # Peut-être que le contenu est trop long ?
  validates :sender_id, presence: true

  scope :unread, -> { where(read: false) }
end
