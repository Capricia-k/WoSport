module Api
  module V1
    class FollowsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_follow, only: [:destroy]

      def create
        follow = current_user.following_relationships.build(follow_params)

        if Follow.exists?(follower_id: current_user.id, followed_id: follow_params[:followed_id])
          return render json: {
            success: false,
            errors: ['You are already following this user'],
            is_following: true
          }, status: :unprocessable_entity
        end

        if follow.save
          render json: {
            success: true,
            follow_id: follow.id,
            followers_count: follow.followed.followers.count
          }
        else
          render json: {
            success: false,
            errors: follow.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def destroy
        followed = @follow.followed
        @follow.destroy
        render json: {
          success: true,
          followers_count: followed.followers.count
        }
      end

      private

      def set_follow
        @follow = current_user.following_relationships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: 'Follow not found'
        }, status: :not_found
      end

      def follow_params
        params.require(:follow).permit(:followed_id)
      end
    end
  end
end
