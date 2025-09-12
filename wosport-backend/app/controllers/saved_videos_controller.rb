class Api::V1::SavedVideosController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.saved_videos
  end

  def create
    video = current_user.saved_videos.build(saved_video_params)
    if video.save
      render json: video, status: :created
    else
      render json: { errors: video.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    video = current_user.saved_videos.find(params[:id])
    video.destroy
    head :no_content
  end

  private

  def saved_video_params
    params.require(:saved_video).permit(:title, :video_url)
  end
end
