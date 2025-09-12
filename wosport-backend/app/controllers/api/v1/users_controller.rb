module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!
      before_action :set_user, only: [:update, :avatar, :show]

      def index
        users = User.where.not(id: current_user.id)
        render json: users, only: [:id, :first_name, :avatar_url]
      end

      def update
        if @user.update(user_params)
          render json: @user.as_json(methods: :avatar_url)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update_profile
        if current_user.update(user_params)
          render json: current_user.as_json(methods: :avatar_url)
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def avatar
        if @user.update(avatar_params)
          render json: { avatar_url: url_for(@user.avatar) }
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def show
        follow = Follow.find_by(follower_id: current_user.id, followed_id: @user.id)

        user_data = @user.as_json(
          only: [:id, :first_name, :last_name, :bio, :profile_visibility],
          methods: [:avatar_url]
        )

        user_data.merge!(
          is_following: follow.present?,
          follow_id: follow&.id,
          posts_count: @user.posts.count,
          followers_count: @user.followers.count,
          following_count: @user.following.count,
          posts: @user.posts.select(:id)
        )

        render json: user_data
      end

      def toggle_visibility
        visibility = params[:profile_visibility]

        if User.profile_visibilities.keys.include?(visibility) && current_user.update(profile_visibility: visibility)
          render json: { profile_visibility: current_user.profile_visibility }
        else
          render json: { errors: ['Invalid visibility'] }, status: :unprocessable_entity
        end
      end

      def save_token
        current_user.update(expo_push_token: params[:expo_push_token])
        render json: { success: true }
      end

      def friends
        user = current_user
        render json: user.following.as_json(only: [:id, :first_name, :avatar_url])
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(
          :first_name,
          :last_name,
          :email,
          :password,
          :password_confirmation,
          :avatar,
          :bio,
          :profile_visibility
        )
      end

      def avatar_params
        params.require(:user).permit(:avatar)
      end
    end
  end
end
