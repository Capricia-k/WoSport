class Video < ApplicationRecord
  has_one_attached :file

  def video_url
    Rails.application.routes.url_helpers.url_for(file) if file.attached?
  end

  def thumbnail_url
    return unless file.attached?

    Cloudinary::Utils.cloudinary_url(
      file.key,
      resource_type: :video,
      format: "jpg",
      width: 300,
      height: 200,
      crop: :fill
    )
  end
end
