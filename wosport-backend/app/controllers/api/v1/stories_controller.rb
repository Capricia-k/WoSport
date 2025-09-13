module Api
  module V1
    class StoriesController < ApplicationController
      include Rails.application.routes.url_helpers
      before_action :authenticate_user!

      # GET /api/v1/stories
      def index
        set_default_host!

        # Get users that current user follows + current user's own stories
        followed_user_ids = current_user.following.pluck(:id) << current_user.id

        stories = Story.active
                      .where(user_id: followed_user_ids)
                      .includes(:user, media_attachments: :blob)
                      .order(created_at: :desc)

        # Group by user
        grouped_stories = stories.group_by(&:user_id).map do |user_id, user_stories|
          user = User.find(user_id)
          {
            user: {
              id: user.id,
              first_name: user.first_name,
              avatar_url: user.avatar_url
            },
            stories: user_stories.map { |s| serialize_story(s) }
          }
        end

        render json: grouped_stories
      end

      # POST /api/v1/stories
      def create
        story = current_user.stories.build(expires_at: 24.hours.from_now)

        if params[:story] && params[:story][:media].present?
          Array(params[:story][:media]).each do |file|
            story.media.attach(file)
          end
        else
          render json: { errors: ["No media provided"] }, status: :unprocessable_entity and return
        end

        if story.save
          set_default_host!
          # schedule cleanup to be safe
          CleanupExpiredStoriesJob.set(wait_until: story.expires_at).perform_later(story.id)
          render json: serialize_story(story), status: :created
        else
          render json: { errors: story.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/stories/:id
      def show
        story = Story.includes(media_attachments: :blob).find(params[:id])
        render json: serialize_story(story)
      end

      # DELETE /api/v1/stories/:id
      def destroy
        story = current_user.stories.find(params[:id])
        story.destroy
        head :no_content
      end

      private

      def serialize_story(story)
        {
          id: story.id,
          user: {
            id: story.user.id,
            first_name: story.user.first_name,
            avatar_url: story.user.avatar_url
          },
          media: story.media.map do |m|
            {
              url: url_for(m),
              content_type: m.blob.content_type,
              filename: m.blob.filename.to_s
            }
          end,
          created_at: story.created_at,
          expires_at: story.expires_at
        }
      end

      def set_default_host!
        return if Rails.application.routes.default_url_options[:host].present?
        Rails.application.routes.default_url_options[:host] = request.base_url
      end
    end
  end
end
