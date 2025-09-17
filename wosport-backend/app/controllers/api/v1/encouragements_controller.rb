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

    @post.reload # 🔑 recharge les associations pour avoir un compteur fiable

    render json: {
      status: message,
      encouragements_count: @post.encouragements.count,
      is_encouraged: @post.encouragements.exists?(user: current_user) # 👈 pratique pour ton front
    }
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end
end
