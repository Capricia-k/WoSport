class Api::V1::PostsController < ApplicationController
  include Rails.application.routes.url_helpers

  before_action :authenticate_user!

  # wrap seulement JSON
  wrap_parameters :post, format: [:json]

  def index
    posts = Post.includes(:user, :comments, :encouragements, photos_attachments: :blob, videos_attachments: :blob)
    posts = posts.where(user_id: params[:user_id]) if params[:user_id]
    posts = posts.order(created_at: :desc)

    render json: posts.map { |post| serialize_post(post) }
  end

  def show
    post = Post.includes(photos_attachments: :blob, videos_attachments: :blob).find(params[:id])
    set_default_host!
    render json: serialize_post(post)
  end

  def create
    Rails.logger.info "post_params: #{post_params.inspect}"
    post = current_user.posts.build(post_params.to_h.except(:photos, :videos))

    attach_files(post, :photos)
    attach_files(post, :videos)

    if post.save
      Rails.logger.info "Photos attached: #{post.photos.attached?}"
      Rails.logger.info "Videos attached: #{post.videos.attached?}"
      set_default_host!
      render json: serialize_post(post), status: :created
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    post = current_user.posts.find(params[:id])
    post.destroy
    head :no_content
  end

  private

  def post_params
    params.require(:post).permit(:content, :visibility, photos: [], videos: [])
  end

  def serialize_post(post)
    {
      id: post.id,
      content: post.content,
      visibility: post.visibility,
      photos: post.photos.map do |p|
        {
          url: url_for(p),
          content_type: p.blob.content_type,
          filename: p.blob.filename.to_s
        }
      end,
      videos: post.videos.map do |v|
        {
          url: rails_blob_url(v, host: Rails.application.routes.default_url_options[:host]),
          content_type: v.blob.content_type,
          filename: v.blob.filename.to_s
        }
      end,
      comments_count: post.comments.size,
      encouragements_count: post.encouragements.size,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user.id,
        first_name: post.user.first_name,
        avatar_url: post.user.avatar_url
      },
      comments: post.comments.map do |c|
        {
          id: c.id,
          body: c.body,
          user_id: c.user_id,
          user: {
            id: c.user.id,
            first_name: c.user.first_name,
            avatar_url: c.user.avatar_url
          }
        }
      end
    }
  end

  def attach_files(post, key)
    Rails.logger.info "Params for #{key}: #{post_params[key].inspect}"
    return unless post_params[key].present?

    Array(post_params[key]).each do |file|
      Rails.logger.info "Attaching #{file.class}"
      post.send(key).attach(file)
    end
  end

  def set_default_host!
    return if Rails.application.routes.default_url_options[:host].present?
    Rails.application.routes.default_url_options[:host] = request.base_url
  end
end
