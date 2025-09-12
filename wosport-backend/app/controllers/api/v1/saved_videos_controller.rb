module Api
  module V1
    class SavedVideosController < ApplicationController
      before_action :authenticate_user!
      before_action :set_saved_video, only: [:show, :destroy]

      def index
        @saved_videos = current_user.saved_videos
        render json: @saved_videos
      end

      def create
        @saved_video = current_user.saved_videos.new(saved_video_params)
        if @saved_video.save
          render json: @saved_video, status: :created
        else
          render json: { errors: @saved_video.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def show
        render json: @saved_video
      end

      def destroy
        @saved_video.destroy
        head :no_content
      end

      private

      def set_saved_video
        @saved_video = current_user.saved_videos.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Video not found" }, status: :not_found
      end

      def saved_video_params
        params.require(:saved_video).permit(:title, :video_url)
      end
    end
  end
end
