class Api::V1::EncouragementsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_post

  def create
    encouragement = @post.encouragements.find_by(user: current_user)

    if encouragement
      encouragement.destroy
      message = "removed"
    else
      @post.encouragements.create!(user: current_user)
      message = "added"
    end

    render json: { status: message, encouragements_count: @post.encouragements.count }
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end
end
